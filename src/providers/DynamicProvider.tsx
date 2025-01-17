'use client';

import { type FC, useCallback, useState, useEffect, useRef } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider, useDynamicContext, type UserProfile } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails } from '../graphql/fetchGenerateUserSessionDetails';
import { useAuthStore } from '../store/authStore';
import { cookies } from '../utils/cookies';
import { type LoginProviderChildrenProps } from './LoginProvider';
import { useConfigStore } from '../store/configStore';

export type DynamicProviderProps = {
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children }) => {
  const { accessToken, authToken, triggerLogout, setAccessToken, setAuthToken, reset: resetStore, showLogin, setShowLogin, setTriggerLogout, setIsNewUser } = useAuthStore();
  const { graphqlApiUrl, dynamicEnvironmentId } = useConfigStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    console.log(`[debug] DynamicProvider: ${JSON.stringify({
      dynamicEnvironmentId,
      graphqlApiUrl,
    })}`)
  }, [graphqlApiUrl, dynamicEnvironmentId]);

  const onLogout = useCallback(() => {
    cookies.reset();
    resetStore();
  }, [resetStore]);

  const onAuthSuccess = useCallback(async ({ user }: { user:UserProfile }) => {
    try {
      const authToken = getAuthToken();

      if (!graphqlApiUrl) throw Error(`Expected Graphql API Url but got ${typeof graphqlApiUrl} `)

      if (!authToken) throw Error(`Expected an authToken but got ${typeof authToken}`);

      console.log(`[debug] DynamicProvider: onAuthSuccess: graphqlApiUrl = ${graphqlApiUrl}`)
      
      setIsLoading(true);
      setAuthToken(authToken);
      setError(undefined);
      setIsNewUser(!!user?.newUser);

      console.log(`[debug] DynamicProvider: !!user?.newUser = ${!!user?.newUser}`)

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
