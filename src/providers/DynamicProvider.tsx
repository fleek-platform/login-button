'use client';

import { type FC, useState, useEffect } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails } from '../graphql/fetchGenerateUserSessionDetails';
import { useAuthStore } from '../store/authStore';
import { cookies } from '../utils/cookies';
import { type LoginProviderChildrenProps } from './LoginProvider';

export type DynamicProviderProps = {
  graphqlApiUrl: string;
  environmentId: string;
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, environmentId }) => {
  const dynamic = useDynamicContext();
  const { accessToken, setAccessToken, setAuthToken, reset: resetStore } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const login = () => dynamic.setShowAuthFlow(true);
  const logout = () => {
    dynamic.handleLogOut();

    // TODO: Check dynamic.handleLogout side-effects
    // to decide where to call onLogout handler instructions
    // e.g. on dynamic logout we should reset state somewhere
    onLogout();
  }

  const onLogout = () => {
    cookies.reset();
    resetStore();
  };

  const onAuthSuccess = async () => {
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
  };

  useEffect(() => {
    cookies.set('accessToken', accessToken);    
  }, [accessToken]);

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        // @ts-ignore
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: { onLogout, onAuthSuccess },
      }}
    >
      <>
        {
          children({
            accessToken,
            isLoading,
            error,
            login,
            logout,
          })
        }
      </>
    </DynamicContextProvider>
  );
};
