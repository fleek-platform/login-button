import { FC, PropsWithChildren } from 'react';

import { CookiesContext, CookiesProvider } from '@/providers/CookiesProvider';
import { DynamicProvider } from '@/providers/DynamicProvider';
import { AuthProvider } from '@/providers/AuthProvider';

type ProvidersProps = PropsWithChildren<{
  requestCookies?: CookiesContext['values'];
  forcedTheme?: string;
}>;

export const Providers: FC<ProvidersProps> = ({ children, requestCookies }) => (
  <CookiesProvider requestCookies={requestCookies}>
    <DynamicProvider>
      <AuthProvider>{children}</AuthProvider>
    </DynamicProvider>
  </CookiesProvider>
);
