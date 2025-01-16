'use client';

import type { FC } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useAuthCookie } from '../hooks/useAuthCookie';
import { useCookies } from '../providers/CookiesProvider';
import { AuthComponent, type AuthComponentProps } from '../components/AuthComponent';
import { generateUserSessionDetails } from '../graphql/fetchGenerateUserSessionDetails';
import { type AuthStore, useAuthStore } from '../store/authStore';

export type DynamicProviderProps = Pick<AuthComponentProps, 'children'> & {
  graphqlApiUrl: string;
  environmentId: string;
};

export type AccessTokenResult = {
  accessTokenState: AuthStore['accessToken'];
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, environmentId }) => {
  const cookies = useCookies();
  const [, setAccessTokenAsCookie, clearAccessToken] = useAuthCookie();

  const { accessToken, setAccessTokenValue, setAccessTokenLoading, setAccessTokenError, resetAccessToken } = useAuthStore();

  const handleLogout = () => {
    cookies.remove('authProviderToken');
    clearAccessToken();
    resetAccessToken();
  };

  const handleAuthSuccess = async () => {
    const authToken = getAuthToken();
    if (!authToken) return '';

    try {
      setAccessTokenLoading(true);
      setAccessTokenError(undefined);

      const sessionDetails = await generateUserSessionDetails(graphqlApiUrl, authToken);
      const { accessToken } = sessionDetails;

      setAccessTokenAsCookie(accessToken);
      setAccessTokenValue(accessToken);
    } catch (requestError) {
      setAccessTokenError(requestError);
    } finally {
      setAccessTokenLoading(false);
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
      <AuthComponent accessTokenResult={{ accessTokenState: accessToken }}>{children}</AuthComponent>
    </DynamicContextProvider>
  );
};
