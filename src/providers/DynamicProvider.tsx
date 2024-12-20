'use client';

import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { useAuthCookie } from '@/hooks/useAuthCookie';

// import { GraphqlClient } from '@/graphql/graphqlClient';
// import { useGenerateUserSessionDetailsMutation } from '@/generated/graphqlClient';
import { generateUserSessionDetails } from '@/graphql/fetchGenerateUserSessionDetails';

import { useCookies } from '@/providers/CookiesProvider';
import { getDefined } from '@/utils/defined';
import { FC, useState } from 'react';
import { AuthComponent, AuthComponentProps } from '@/components/AuthComponent';

export type DynamicProviderProps = Pick<AuthComponentProps, 'children'>;

export type AccessTokenResult = {
  accessToken: string;
  isLoading: boolean;
  error: unknown;
};

const environmentId = getDefined('NEXT_PUBLIC_LB__DYNAMIC_ENVIRONMENT_ID');

export const DynamicProvider: FC<DynamicProviderProps> = ({ children }) => {
  const cookies = useCookies();
  const [, , clearAccessToken] = useAuthCookie();
  // const [, generateUserSessionDetails] = useGenerateUserSessionDetailsMutation();

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

      // 1.
      // const graphqlClient = new GraphqlClient({});
      // const sessionDetails = await graphqlClient.generateUserSessionDetails({ authToken });

      // 2.
      // const { data, error } = await generateUserSessionDetails({
      //   data: { authToken },
      // });

      // 3.
      const sessionDetails = await generateUserSessionDetails(authToken);
      const { accessToken } = sessionDetails;

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
