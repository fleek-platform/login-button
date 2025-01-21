'use client';

import { type FC, useCallback, useState, useEffect } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext, type UserProfile } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails } from '../api/graphql-client';
import { useAuthStore } from '../store/authStore';
import { cookies } from '../utils/cookies';
import { type LoginProviderChildrenProps } from './LoginProvider';
import { useConfigStore } from '../store/configStore';

export type DynamicProviderProps = {
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children }) => {
  const {
    accessToken,
    authToken,
    setAccessToken,
    setAuthToken,
    reset: resetStore,
    setIsNewUser,
    triggerLoginModal,
    setTriggerLoginModal,
    setTriggerLogout,
    triggerLogout,
    setIsLoggedIn,
  } = useAuthStore();
  const { graphqlApiUrl, dynamicEnvironmentId } = useConfigStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  // TODO: Remove useCallback to inspect re-triggers
  const onLogout = useCallback(() => {
    cookies.reset();
    // TODO: Make sure the reset is not clearing
    // the trigger callbacks
    resetStore();
    setIsLoggedIn(false);
  }, [cookies, resetStore, setIsLoggedIn]);

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
        setIsNewUser(!!user?.newUser);

        const result = await generateUserSessionDetails(graphqlApiUrl, authToken);

        if (!result.success) throw Error(result.error.message);

        if (!result.data.accessToken) throw Error(`Expected a valid access token but got ${typeof result.data.accessToken}`);

        setAccessToken(result.data.accessToken);
        setIsLoggedIn(true);
      } catch (err) {
        console.error(err)
        // TODO: Is this really required?
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [graphqlApiUrl, setAuthToken, setAccessToken, setIsLoggedIn],
  );

  useEffect(() => {
    if (!accessToken) return;

    cookies.set('accessToken', accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!authToken) return;

    cookies.set('authToken', authToken);
  }, [accessToken]);

  const DynamicUtils = () => {
    const { sdkHasLoaded, setShowAuthFlow, handleLogOut } = useDynamicContext();

    useEffect(() => {
      if (!sdkHasLoaded || triggerLoginModal) return;
      setTriggerLoginModal(setShowAuthFlow);
    }, [setTriggerLoginModal,sdkHasLoaded]);

    useEffect(() => {
      if (!sdkHasLoaded || triggerLogout) return;

      setTriggerLogout(handleLogOut);
    }, [setTriggerLogout,sdkHasLoaded]);

    return <></>;
  };

  const settings = {
    environmentId: dynamicEnvironmentId,
    walletConnectors: [EthereumWalletConnectors],
    // eventsCallbacks: { onLogout, onAuthSuccess },
    events: {
      onLogout,
      onAuthSuccess,
    },
    // TODO: Use the correct override
    // using scale might not be appropriate
    // https://docs.dynamic.xyz/design-customizations/css/css-variables#css-variables
    shadowDOMEnabled: false,
    cssOverrides: '.modal__items { scale: 1.5 }',
  };

  return (
    <DynamicContextProvider settings={settings}>
      <DynamicUtils />
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
