import type { FC } from 'react';

import { DynamicProvider, type DynamicProviderProps } from '../providers/DynamicProvider';

export interface LoginProviderChildrenProps {
  accessToken: string;
  isLoading: boolean;
  error: unknown;
  login: () => void;
  logout: () => void;
}

export const LoginProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, dynamicEnvironmentId }) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <DynamicProvider
      graphqlApiUrl={graphqlApiUrl}
      dynamicEnvironmentId={dynamicEnvironmentId}
    >
      {children}
    </DynamicProvider>
  );
}
