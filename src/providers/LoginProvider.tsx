import type { FC } from 'react';

import { type CookiesContext, CookiesProvider } from '../providers/CookiesProvider';
import { DynamicProvider, type DynamicProviderProps } from '../providers/DynamicProvider';

export type LoginProviderProps = {
  requestCookies?: CookiesContext['values'];
} & DynamicProviderProps;

// main component to publish
export const LoginProvider: FC<LoginProviderProps> = ({ children, requestCookies, graphqlApiUrl, environmentId }) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <CookiesProvider requestCookies={requestCookies}>
      <DynamicProvider graphqlApiUrl={graphqlApiUrl} environmentId={environmentId}>
        {children}
      </DynamicProvider>
    </CookiesProvider>
  );
};

// a change to test changeset workflow
