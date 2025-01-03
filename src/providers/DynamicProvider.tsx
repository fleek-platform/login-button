'use client';

import { type FC, useState } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useAuthCookie } from '../hooks/useAuthCookie';
import { useCookies } from '../providers/CookiesProvider';
import { AuthComponent, type AuthComponentProps } from '../components/AuthComponent';
import { generateUserSessionDetails } from '../graphql/fetchGenerateUserSessionDetails';

export type DynamicProviderProps = Pick<AuthComponentProps, 'children'> & {
  graphqlApiUrl: string;
  environmentId: string;
};

export type AccessTokenResult = {
  accessToken: string;
  isLoading: boolean;
  error: unknown;
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, environmentId }) => {
  const cookies = useCookies();
  const [, setAccessTokenAsCookie, clearAccessToken] = useAuthCookie();

  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const handleLogout = () => {
    cookies.remove('authProviderToken');
    cookies.remove('accessToken');
    clearAccessToken();
  };

  const handleAuthSuccess = async () => {
    const authToken = getAuthToken();
    if (!authToken) return '';

    try {
      setIsLoading(true);
      setError(undefined);

      const sessionDetails = await generateUserSessionDetails(graphqlApiUrl, authToken);
      const { accessToken } = sessionDetails;

      // set cookie
      setAccessTokenAsCookie(accessToken);
      // pass to login button
      setAccessToken(accessToken);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setIsLoading(false);
    }
  };

  const accessTokenResult = { accessToken, isLoading, error };

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        // @ts-ignore
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: { onLogout: handleLogout, onAuthSuccess: handleAuthSuccess },
      }}
    >
      <AuthComponent accessTokenResult={accessTokenResult}>{children}</AuthComponent>
    </DynamicContextProvider>
  );
};
