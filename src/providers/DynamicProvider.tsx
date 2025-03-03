'use client';

import { type FC, useCallback, useState, useEffect } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext, type UserProfile } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails, me, project } from '../api/graphql-client';
import { type TriggerLoginModal, type TriggerLogout, useAuthStore } from '../store/authStore';
import { cookies } from '../utils/cookies';
import type { LoginProviderChildrenProps } from './LoginProvider';
import { clearStorageByMatchTerm, clearUserSessionKeys } from '../utils/browser';
import { decodeAccessToken, truncateMiddle } from '../utils/token';
import cssOverrides from '../css/index.css';
import { hasLocalStorageItems } from '../utils/store';

type DynamicUtilsProps = {
  onTriggerLoginModal?: (callback: TriggerLoginModal) => void;
  onTriggerLogout?: (triggerLogout: TriggerLogout) => void;
};

const DynamicUtils = ({ onTriggerLoginModal, onTriggerLogout }: DynamicUtilsProps) => {
  const { sdkHasLoaded, setShowAuthFlow, handleLogOut } = useDynamicContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies(setShowAuthFlow): causes infinite render, probably not memoized
  useEffect(() => {
    if (!sdkHasLoaded || !onTriggerLoginModal) return;
    onTriggerLoginModal(setShowAuthFlow);
  }, [onTriggerLoginModal, sdkHasLoaded]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(handleLogOut): causes infinite render, probably not memoized
  useEffect(() => {
    if (!sdkHasLoaded || !onTriggerLogout) return;
    onTriggerLogout(handleLogOut);
  }, [onTriggerLogout, sdkHasLoaded]);

  return null;
};

export type DynamicProviderProps = {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
  onAuthenticationSuccess?: () => void;
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

const validateUserSession = async ({
  accessToken,
  graphqlApiUrl,
  onAuthenticationFailure,
  onAuthenticationSuccess,
}: {
  accessToken: string;
  graphqlApiUrl: string;
  onAuthenticationFailure: () => void;
  onAuthenticationSuccess?: () => void;
}): Promise<boolean> => {
  console.log(`[debug] DynamicProvider: 1`);

  try {
    const cookieAuthToken = cookies.get('authToken');
    const cookieAccessToken = cookies.get('accessToken');
  console.log(`[debug] DynamicProvider: data: `, JSON.stringify({
    cookieAuthToken,
    cookieAccessToken,
  }));

    const hasDynamicLocalStorageItems = hasLocalStorageItems('dynamic');

    const hasDynamicAuthWithoutAccessTokens = hasDynamicLocalStorageItems && (!cookieAuthToken || !cookieAccessToken);

    const hasDynamicAuthWithAccessTokens = hasDynamicLocalStorageItems && !!accessToken && !!cookieAuthToken && !!cookieAccessToken;

    const hasMatchingAcessTokenInCookie = accessToken && (accessToken === cookieAccessToken);

    console.log(`[debug] DynamicProvider: 3: data:`, {
      hasDynamicLocalStorageItems,
      hasDynamicAuthWithoutAccessTokens,
      hasDynamicAuthWithAccessTokens,
      hasMatchingAcessTokenInCookie,
    })

    if (hasDynamicAuthWithoutAccessTokens) {
    console.log(`[debug] DynamicProvider: 3.1: clear`);
      cookies.reset();
      clearUserSessionKeys();

      return false;
    }
    console.log(`[debug] DynamicProvider: 4`);

    if (!hasDynamicAuthWithAccessTokens || !cookieAccessToken) return false;
    console.log(`[debug] DynamicProvider: 5`);

    if (!hasMatchingAcessTokenInCookie)
      throw Error(
        `Expected ${truncateMiddle(accessToken)} but got ${typeof cookieAccessToken === 'string' ? truncateMiddle(cookieAccessToken) : typeof cookieAccessToken}`,
      );
    console.log(`[debug] DynamicProvider: 6`);

    const projectId = decodeAccessToken(cookieAccessToken);

    if (!projectId) throw Error(`Expected a Project identifier but got ${projectId || typeof projectId}`);
    console.log(`[debug] DynamicProvider: 7`);

    const { success: hasMe } = await me(graphqlApiUrl, cookieAccessToken);

    const { success: hasProject } = await project(graphqlApiUrl, cookieAccessToken, projectId);

    const hasUserSessionExpectedDetails = hasMe && hasProject;
    console.log(`[debug] DynamicProvider: 8: hasUserSessionExpectedDetails = ${hasUserSessionExpectedDetails}`);

    if (!hasUserSessionExpectedDetails) throw Error('Unexpected user session details');
    console.log(`[debug] DynamicProvider: 9`);

    typeof onAuthenticationSuccess === 'function' && onAuthenticationSuccess();

    return true;
  } catch (error) {
    console.error('Authentication validation failed', error);
    onAuthenticationFailure();
    return false;
  }
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, dynamicEnvironmentId, onAuthenticationSuccess }) => {
  const {
    accessToken,
    setAccessToken,
    setAuthToken,
    reset: resetStore,
    setUserProfile,
    setIsNewUser,
    triggerLoginModal,
    setTriggerLoginModal,
    setTriggerLogout,
    triggerLogout,
    setIsLoggedIn,
    projectId,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const onLogout = useCallback(() => {
    cookies.reset();
    // TODO: Make sure the reset is not clearing
    // the trigger callbacks
    resetStore();
    // TODO: Dashboard has a concurrent process
    // that should also match these requirements
    // Clear critical stores
    clearUserSessionKeys();
    setIsLoggedIn(false);
    window.location.reload();
  }, [resetStore, setIsLoggedIn]);

  // TODO: Remove useCallback to inspect re-triggers
  const onAuthSuccess = useCallback(
    async ({ user }: { user: UserProfile }) => {
      console.log(`[debug] DynamicProvider: onAuthSuccess: user = ${JSON.stringify(user)}`)
      try {
        const authToken = getAuthToken();

        if (!graphqlApiUrl) throw Error(`Expected Graphql API Url but got ${typeof graphqlApiUrl} `);

        if (!authToken) throw Error(`Expected an authToken but got ${typeof authToken}`);

        setIsLoading(true);
        setAuthToken(authToken);
        setError(undefined);
        setUserProfile(user);
        setIsNewUser(!!user?.newUser);

        const result = await generateUserSessionDetails(graphqlApiUrl, authToken);

        if (!result.success) throw Error(result.error.message);

        if (!result.data.accessToken) throw Error(`Expected a valid access token but got ${typeof result.data.accessToken}`);

        setAccessToken(result.data.accessToken);
        setIsLoggedIn(true);

        typeof onAuthenticationSuccess === 'function' && onAuthenticationSuccess();
      } catch (err) {
        console.error(err);
        // TODO: Is this really required?
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [graphqlApiUrl, setAuthToken, setAccessToken, setIsLoggedIn, setUserProfile, setIsNewUser, onAuthenticationSuccess],
  );

  useEffect(() => {
    const authToken = cookies.get('authToken');
    const accessToken = cookies.get('accessToken');

    if (!authToken) {
      return;
    }

    if (!accessToken) {
      return;
    }

    try {
      decodeAccessToken(accessToken);
      setAuthToken(authToken);
      setAccessToken(accessToken);
      setIsLoggedIn(true);
    } catch (_err) {
      console.warn('A user access token was found to be invalid!');
    }
  }, [setAuthToken, setAccessToken, setIsLoggedIn]);

  useEffect(() => {
    if (!graphqlApiUrl) return;

    // Validates the user session sometime in the future.
    // If found faulty, it should clear the user session
    // e.g. user session clear/logout by dashboard.
    // On the other hand, an existing user session can
    // persist (localStorage), but dashboard uses cookies
    // e.g. user logins in website and expect cross session.
    // This is more of a safe-guard due to Dashboard
    // having the requirement to clear localStorage items
    // that match prefix `fleek-xyz-login`, meaning
    // we're only computing if that fails to happen
    validateUserSession({
      accessToken,
      graphqlApiUrl,
      onAuthenticationFailure: () => onLogout(),
    });
  }, [accessToken, graphqlApiUrl, onLogout]);

  const settings = {
    environmentId: dynamicEnvironmentId,
    walletConnectors: [EthereumWalletConnectors],
    events: {
      onLogout,
      onAuthSuccess,
    },
    // TODO: Use the correct override
    // using scale might not be appropriate
    // https://docs.dynamic.xyz/design-customizations/css/css-variables#css-variables
    shadowDOMEnabled: false,
    cssOverrides,
  };

  return (
    <DynamicContextProvider settings={settings}>
      <DynamicUtils onTriggerLoginModal={setTriggerLoginModal} onTriggerLogout={setTriggerLogout} />
      {children({
        accessToken,
        isLoading,
        error,
        login: () => typeof triggerLoginModal === 'function' && triggerLoginModal(true),
        logout: () => typeof triggerLogout === 'function' && triggerLogout(),
      })}
    </DynamicContextProvider>
  );
};
