'use client';

import { type FC, useCallback, useState, useEffect } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext, type UserProfile, useReinitialize } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails, me, project } from '../api/graphql-client';
import { type TriggerLoginModal, type TriggerLogout, useAuthStore, type ReinitializeSdk } from '../store/authStore';
import { cookies } from '../utils/cookies';
import type { LoginProviderChildrenProps } from './LoginProvider';
import { clearUserSessionKeys } from '../utils/browser';
import { decodeAccessToken, truncateMiddle } from '../utils/token';
import cssOverrides from '../css/index.css';
import { hasLocalStorageItems } from '../utils/store';
import { debounce } from 'lodash-es';

type DynamicUtilsProps = {
  onTriggerLoginModal?: (callback: TriggerLoginModal) => void;
  onTriggerLogout?: (triggerLogout: TriggerLogout) => void;
  graphqlApiUrl: string;
  accessToken: string;
  onLogout: () => void;
  setReinitializeSdk: (callback: ReinitializeSdk) => void;
};

const DynamicUtils = ({ onTriggerLoginModal, onTriggerLogout, graphqlApiUrl, accessToken, onLogout, setReinitializeSdk }: DynamicUtilsProps) => {
  const { sdkHasLoaded, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const reinitializeSdk = useReinitialize();
  const localStorageAuthToken = getAuthToken();

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

  useEffect(() => {
    if (!reinitializeSdk) return;
    
    setReinitializeSdk(reinitializeSdk);
  }, [setReinitializeSdk, reinitializeSdk]);

  useEffect(() => {
    if (!graphqlApiUrl) return;

    // TODO: Should we really debounce the call?
    // This served as a safe-guard for quick page refreshes
    // but doesn't seem to be important?
    const debouncedValidation = debounce(() => {
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
        localStorageAuthToken,
        graphqlApiUrl,
        reinitializeSdk,
        onAuthenticationFailure: () => onLogout(),
      });
    }, 400);

    debouncedValidation();

    (window as any).reinitializeSdk = reinitializeSdk;

    return () => debouncedValidation.cancel();
  }, [accessToken, graphqlApiUrl]);

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
  localStorageAuthToken,
  graphqlApiUrl,
  onAuthenticationFailure,
  onAuthenticationSuccess,
  reinitializeSdk,
}: {
  accessToken: string;
  localStorageAuthToken?: string;
  graphqlApiUrl: string;
  onAuthenticationFailure: () => void;
  onAuthenticationSuccess?: () => void;
  reinitializeSdk?: () => void;
}): Promise<boolean> => {
  try {
    const cookieAuthToken = cookies.get('authToken');
    const cookieAccessToken = cookies.get('accessToken');

    // TODO: Maybe use the https://docs.dynamic.xyz/react-sdk/utilities/getauthtoken#getauthtoken
    // to avoid using localStorage directly
    const hasDynamicLocalStorageItems = !!hasLocalStorageItems('dynamic') && !!localStorageAuthToken;

    const hasDynamicAuthWithoutAccessTokens = !!hasDynamicLocalStorageItems && (!cookieAuthToken || !cookieAccessToken);

    const hasDynamicAuthWithAccessTokens = !!hasDynamicLocalStorageItems && !!accessToken && !!cookieAuthToken && !!cookieAccessToken;

    const hasMatchingAcessTokenInCookie = !!accessToken && (accessToken === cookieAccessToken);

    if (hasDynamicAuthWithoutAccessTokens) 
      throw Error('Found missing Dynamic cookie paired tokens');

    if (!hasDynamicAuthWithAccessTokens || !cookieAccessToken) return false;

    if (!hasMatchingAcessTokenInCookie)
      throw Error(
        `Expected ${truncateMiddle(accessToken)} but got ${typeof cookieAccessToken === 'string' ? truncateMiddle(cookieAccessToken) : typeof cookieAccessToken}`,
      );

    const projectId = decodeAccessToken(cookieAccessToken);

    if (!projectId) throw Error(`Expected a Project identifier but got ${projectId || typeof projectId}`);

    const [hasMeResult, hasProjectResult] = await Promise.all([
      me(graphqlApiUrl, cookieAccessToken),
      project(graphqlApiUrl, cookieAccessToken, projectId),
    ]);

    // Important to prevent false status checkups
    // e.g. it might cause to call `onAuthenticationFailure`
    // which would clear the user session details wrongly
    const hasNetworkError =
      !hasMeResult.success && (hasMeResult as any)?.error?.type === 'NETWORK_ERROR' ||
      !hasProjectResult.success && (hasProjectResult as any)?.error?.type === 'NETWORK_ERROR';

    if (hasNetworkError) 
      return false;
    

    const hasMe = !!hasMeResult.success;
    const hasProject = !!hasProjectResult.success;
    
    const hasUserSessionExpectedDetails = hasMe && hasProject;

    if (!hasUserSessionExpectedDetails) throw Error('Unexpected user session details');

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
    setReinitializeSdk,
    reinitializeSdk,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const onLogout = () => {
    cookies.reset();

    resetStore();

    // TODO: Dashboard has a concurrent process
    // that should also match these requirements
    // Clear critical stores
    clearUserSessionKeys();

    setIsLoggedIn(false);

    typeof reinitializeSdk === 'function' && reinitializeSdk();

    window.location.reload();
  };

  // TODO: Remove useCallback to inspect re-triggers
  const onAuthSuccess = useCallback(
    async ({ user }: { user: UserProfile }) => {
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

  // Support cross application user session
  // by applying authentication user details
  // from user cookies based on app hostname
  // e.g. *fleek.xyz
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
      <DynamicUtils
        accessToken={accessToken}
        graphqlApiUrl={graphqlApiUrl}
        onTriggerLoginModal={setTriggerLoginModal}
        onTriggerLogout={setTriggerLogout}
        onLogout={onLogout}
        setReinitializeSdk={setReinitializeSdk}
      />
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
