'use client';

import type { FC } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useAuthCookie } from '../hooks/useAuthCookie';
import { useCookies } from '../providers/CookiesProvider';
import { AuthComponent, type AuthComponentProps } from '../components/AuthComponent';
import { generateUserSessionDetails } from '../graphql/fetchGenerateUserSessionDetails';
import { type AuthState, useAuthStore } from '../store/authStore';

export type DynamicProviderProps = Pick<AuthComponentProps, 'children'> & {
  graphqlApiUrl: string;
  environmentId: string;
};

export type AccessTokenResult = AuthState;

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, environmentId }) => {
  const cookies = useCookies();
  const [, setAccessTokenAsCookie, clearAccessToken] = useAuthCookie();

  const { accessToken, loading, error, setAccessToken, setLoading, setError, resetAuthState } = useAuthStore();

  const handleLogout = () => {
    cookies.remove('authProviderToken');
    clearAccessToken();
    resetAuthState();
  };

  const handleAuthSuccess = async () => {
    const authToken = getAuthToken();
    if (!authToken) return '';

    try {
      setLoading(true);
      setError(undefined);

      const sessionDetails = await generateUserSessionDetails(graphqlApiUrl, authToken);
      const { accessToken } = sessionDetails;

      setAccessTokenAsCookie(accessToken);
      setAccessToken(accessToken);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  };

  const accessTokenResult = { accessToken, loading, error };

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
