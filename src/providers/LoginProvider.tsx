import { type FC, useEffect } from 'react';

import { DynamicProvider } from '../providers/DynamicProvider';
import { isClient } from '../utils/browser';
import { useConfigStore } from '../store/configStore';

export interface LoginProviderChildrenProps {
  accessToken: string;
  isLoading: boolean;
  error: unknown;
  login: () => void;
  logout: () => void;
}

export type LoginProviderProps = {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
  onAuthenticationSuccess?: () => void;
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

export const LoginProvider: FC<LoginProviderProps> = ({ children, graphqlApiUrl, dynamicEnvironmentId, onAuthenticationSuccess }) => {
  if (!isClient) {
    return null;
  }

  // Use configStore for configuration needs
  const { setConfig } = useConfigStore();

  // Override if user provide Graphql API URL
  useEffect(() => {
    if (!graphqlApiUrl) return;

    setConfig({
      graphqlApiUrl,
    });
  }, [graphqlApiUrl, setConfig]);

  // Override if user provide Dynamic Environment ID
  useEffect(() => {
    if (!dynamicEnvironmentId) return;

    setConfig({
      dynamicEnvironmentId,
    });
  }, [dynamicEnvironmentId, setConfig]);

  return (
    <DynamicProvider
      graphqlApiUrl={graphqlApiUrl}
      dynamicEnvironmentId={dynamicEnvironmentId}
      onAuthenticationSuccess={onAuthenticationSuccess}
    >
      {children}
    </DynamicProvider>
  );
};
