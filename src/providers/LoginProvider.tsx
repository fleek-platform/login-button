import type { FC } from 'react';

import { DynamicProvider, type DynamicProviderProps } from '../providers/DynamicProvider';

export interface LoginProviderChildrenProps {
  accessToken: string;
  isLoading: boolean;
  error: unknown;
  login: () => void;
  logout: () => void;
}

export const LoginProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, environmentId }) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <DynamicProvider
      graphqlApiUrl={graphqlApiUrl}
      environmentId={environmentId}
    >
      {children}
    </DynamicProvider>
  );
}
