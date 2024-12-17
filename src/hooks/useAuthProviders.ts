import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

import { useCookies } from '@/providers/CookiesProvider';
import { config } from '@/config';
import { GraphqlClient } from '@/graphql/graphqlClient';

export type AuthProviders = 'dynamic';

export type AuthWith = {
  handleLogin: () => void;
  handleLogout: () => void;
  requestAccessToken: (projectId?: string) => Promise<string>;
  token: string | undefined;
};

export const useAuthProviders = (): Record<AuthProviders, AuthWith> => {
  const dynamic = useAuthWithDynamic();

  return {
    dynamic,
    ...(config.TEST_MODE ? { mocked: getMockedProvider() } : {}),
  };
};

const useAuthWithDynamic = (): AuthWith => {
  const dynamic = useDynamicContext();

  const handleLogin = () => dynamic.setShowAuthFlow(true);

  const handleLogout = () => dynamic.handleLogOut();

  const requestAccessToken = async (projectId?: string): Promise<string> => {
    if (!dynamic.authToken) {
      return '';
    }

    const graphqlClient = new GraphqlClient({});
    const token = await graphqlClient.loginWithDynamic({ authToken: dynamic.authToken, projectId });

    return token;
  };

  return {
    handleLogin,
    handleLogout,
    requestAccessToken,
    token: dynamic.authToken,
  };
};

const getMockedProvider: () => AuthWith = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const cookies = useCookies();

  return {
    handleLogin: () => {},
    handleLogout: () => {},
    requestAccessToken: async () => 'mocked-token',
    token: cookies.values.authProviderToken,
  };
};
