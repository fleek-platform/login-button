import { useCallback, useEffect, useState } from 'react';

import { useAuthCookie } from '@/hooks/useAuthCookie';
import { AuthProviders, AuthWith, useAuthProviders } from '@/hooks/useAuthProviders';
import { createContext } from '@/utils/createContext';

import { useCookies } from '@/providers/CookiesProvider';

export type AuthContext = {
  loading: boolean;
  error?: unknown;
  token?: string;
  redirectUrl: string | null;

  login: (provider: AuthProviders, redirectUrl?: string) => void;
  logout: () => void;
  switchProjectAuth: (projectId: string) => Promise<void>;
  setRedirectUrl: React.Dispatch<React.SetStateAction<string | null>>;
};

const [Provider, useContext] = createContext<AuthContext>({
  name: 'AuthContext',
  hookName: 'useAuthContext',
  providerName: 'AuthProvider',
});

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [accessToken, setAccessToken, clearAccessToken] = useAuthCookie();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const cookies = useCookies();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const providers = useAuthProviders();
  const providersValues = Object.values(providers);

  const login = useCallback(
    (providerName: AuthProviders, redirectUrl?: string) => {
      if (redirectUrl) {
        setRedirectUrl(redirectUrl);
      }

      const provider = providers[providerName];
      provider.handleLogin();
    },
    [providers]
  );

  const logout = useCallback(async () => {
    cookies.remove('authProviderToken');

    providersValues.forEach((provider) => {
      if (provider.token) {
        provider.handleLogout();
      }
    });

    cookies.remove('projectId');
    clearAccessToken();
  }, [cookies, clearAccessToken, providersValues]);

  const requestAccessToken = useCallback(
    async (provider: AuthWith, projectId?: string) => {
      if (loading) {
        return;
      }

      try {
        setLoading(true);
        setError(undefined);

        const token = await provider.requestAccessToken(projectId);
        setAccessToken(token);
      } catch (requestError) {
        logout();
        setError(requestError);
      } finally {
        setLoading(false);
      }
    },
    [setAccessToken, loading, logout]
  );

  const switchProjectAuth = useCallback(
    async (projectId: string) => {
      const provider = providersValues.find((provider) => provider.token);

      if (provider) {
        return requestAccessToken(provider, projectId);
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providersValues, requestAccessToken]
  );

  useEffect(() => {
    const provider = providersValues.find((provider) => provider.token);

    if (provider?.token) {
      // if has a provider token, it means that auth provider is authenticated
      cookies.set('authProviderToken', provider.token);

      // uses the auth provider token to request the access token from graphql
      if (!accessToken) {
        requestAccessToken(provider);
      }
    } else {
      logout();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.values.authProviderToken, ...providersValues.map((provider) => provider.token)]);

  return (
    <Provider
      value={{
        loading,
        error,
        login,
        logout,
        switchProjectAuth,
        token: accessToken,
        redirectUrl,
        setRedirectUrl,
      }}
    >
      {children}
    </Provider>
  );
};

export const useAuthContext = useContext;
