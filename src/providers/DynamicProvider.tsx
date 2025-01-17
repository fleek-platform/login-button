'use client';

import { type FC, useCallback, useState, useEffect, useRef } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails } from '../graphql/fetchGenerateUserSessionDetails';
import { useAuthStore } from '../store/authStore';
import { cookies } from '../utils/cookies';
import { type LoginProviderChildrenProps } from './LoginProvider';

export type DynamicProviderProps = {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, dynamicEnvironmentId }) => {
  const { accessToken, authToken, triggerLogout, setAccessToken, setAuthToken, reset: resetStore, showLogin, setShowLogin, setTriggerLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const onLogout = useCallback(() => {
    cookies.reset();
    resetStore();
  }, [resetStore]);

  const onAuthSuccess = useCallback(async () => {
    try {
      const authToken = getAuthToken();

      if (!authToken) throw Error(`Expected an authToken but got ${typeof authToken}`);
      
      setIsLoading(true);
      setAuthToken(authToken);
      setError(undefined);

      const sessionDetails = await generateUserSessionDetails(graphqlApiUrl, authToken);
      const { accessToken } = sessionDetails;
            
      setAccessToken(accessToken);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setIsLoading(false);
    }
  }, [graphqlApiUrl, setAuthToken, setAccessToken]);

  useEffect(() => {
    if (!accessToken) return;
    
    cookies.set('accessToken', accessToken);    
  }, [accessToken]);

  useEffect(() => {
    if (!authToken) return;
    
    cookies.set('authToken', authToken);    
  }, [accessToken]);

  const DynamicUtils = () => {
    const dynamic = useDynamicContext();

    useEffect(() => {
      if (!showLogin) return;

      dynamic.setShowAuthFlow(true);
    }, [showLogin]);

    useEffect(() => {
      if (!triggerLogout) return;

      dynamic.handleLogOut();
    }, [triggerLogout])

    return null;
  };

  const settings = {
    environmentId: dynamicEnvironmentId,
    walletConnectors: [EthereumWalletConnectors],
    eventsCallbacks: { onLogout, onAuthSuccess },
  };

  return (
    <DynamicContextProvider settings={settings}>
      <DynamicUtils />
      {children({
        accessToken,
        isLoading,
        error,
        login: () => setShowLogin(true),
        logout: () => setTriggerLogout(true),
      })}
    </DynamicContextProvider>
  );
};
