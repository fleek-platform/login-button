'use client';

import { type FC, useCallback, useState, useEffect } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext, type UserProfile } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails, me, project } from '../api/graphql-client';
import { type TriggerLoginModal, type TriggerLogout, useAuthStore } from '../store/authStore';
import { cookies } from '../utils/cookies';
import type { LoginProviderChildrenProps } from './LoginProvider';
import { clearStorageByMatchTerm } from '../utils/browser';
import { decodeAccessToken } from '../utils/token';
import cssOverrides from '../css/index.css';

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
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

const validateUserSession = async ({
  accessToken,
  graphqlApiUrl,
  projectId,
  onAuthenticationFailure,
  onAuthenticationSuccess = () => {},
}: {
  accessToken: string;
  graphqlApiUrl: string;
  projectId: string;
  onAuthenticationFailure: () => void;
  onAuthenticationSuccess?: () => void;
}): Promise<boolean> => {
  try {
    const { success: meSuccess } = await me(graphqlApiUrl, accessToken);
    
    const { success: projectSuccess } = await project(graphqlApiUrl, accessToken, projectId);

    if (!meSuccess || !projectSuccess) {
      onAuthenticationFailure();
      return false;
    }
    
    typeof onAuthenticationSuccess === 'function' && onAuthenticationSuccess();

    return true;
  } catch (error) {
    console.error('Authentication validation failed:', error);
    onAuthenticationFailure();
    return false;
  }
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, dynamicEnvironmentId }) => {
  const {
    accessToken,
    authToken,
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

  // TODO: Remove useCallback to inspect re-triggers
  const onLogout = useCallback(() => {
    cookies.reset();
    // TODO: Make sure the reset is not clearing
    // the trigger callbacks
    resetStore();
    // Clear critical stores
    for (const item of ['dynamic', 'wagmi', 'fleek-xyz']) {
      clearStorageByMatchTerm(item);
    }
    setIsLoggedIn(false);
    window.location.reload();
  }, [resetStore, setIsLoggedIn]);

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
      } catch (err) {
        console.error(err);
        // TODO: Is this really required?
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [graphqlApiUrl, setAuthToken, setAccessToken, setIsLoggedIn, setUserProfile, setIsNewUser],
  );

  useEffect(() => {
    if (!accessToken) return;

    cookies.set('accessToken', accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!authToken) return;

    cookies.set('authToken', authToken);
  }, [authToken]);

  useEffect(() => {
    if (!projectId) return;

    cookies.set('projectId', projectId);
  }, [projectId]);

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
    if (!accessToken || !graphqlApiUrl) return;

    // Validates the user session sometime in the future
    // if found faulty, it should clear the user session
    validateUserSession({
      accessToken,
      graphqlApiUrl,
      projectId,
      onAuthenticationFailure: () => 
        typeof triggerLogout === 'function' && triggerLogout(),
    });
  }, [accessToken, graphqlApiUrl, projectId]);

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
