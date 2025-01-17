'use client';

import { type FC, useState } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { type AuthComponentProps } from '../components/AuthComponent';
import { generateUserSessionDetails } from '../graphql/fetchGenerateUserSessionDetails';
import { useAuthStore } from '../store/authStore';
import { cookies } from '../utils/cookies';

export type DynamicProviderProps = Pick<AuthComponentProps, 'children'> & {
  graphqlApiUrl: string;
  environmentId: string;
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, environmentId }) => {
  const dynamic = useDynamicContext();
  const { accessToken, setAccessToken, setAuthToken } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const login = () => dynamic.setShowAuthFlow(true);
  const logout = () => dynamic.handleLogOut();

  const handleLogout = () => {
    cookies.reset();
  };

  const handleAuthSuccess = async () => {
    const authToken = getAuthToken();

    if (!authToken) return '';

    try {
      setIsLoading(true);
      setAuthToken(authToken);
      setError(undefined);

      const sessionDetails = await generateUserSessionDetails(graphqlApiUrl, authToken);
      const { accessToken } = sessionDetails;

      cookies.set('accessToken', accessToken);

      setAccessToken(accessToken);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        // @ts-ignore
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: { onLogout: handleLogout, onAuthSuccess: handleAuthSuccess },
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
