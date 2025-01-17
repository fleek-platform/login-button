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

type DynamicAuthCallback = () => void;

const defaultDynamicCallback = () => console.warn('Dynamic is not ready yet!')

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, dynamicEnvironmentId }) => {
  const { accessToken, authToken, setAccessToken, setAuthToken, reset: resetStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  
  const loginRef = useRef<DynamicAuthCallback>(defaultDynamicCallback);
  const logoutRef = useRef<DynamicAuthCallback>(defaultDynamicCallback);

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
      loginRef.current = () => dynamic.setShowAuthFlow(true);
      logoutRef.current = () => {
        dynamic.handleLogOut();

        // TODO: Check the side-effects of dynamic handleLogout
        // as we need to provide a callback to reset app state
        // e.g. onLogout
        onLogout();
      };
    }, [dynamic]);

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
        login: () => loginRef.current(),
        logout: () => logoutRef.current(),
      })}
    </DynamicContextProvider>
  );
};
