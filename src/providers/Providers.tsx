import { FC } from 'react';

import { CookiesContext, CookiesProvider } from '@/providers/CookiesProvider';
import { DynamicProvider, DynamicProviderProps } from '@/providers/DynamicProvider';

export type ProvidersProps = {
  requestCookies?: CookiesContext['values'];
} & DynamicProviderProps;

export const Providers: FC<ProvidersProps> = ({ children, requestCookies }) => (
  <CookiesProvider requestCookies={requestCookies}>
    <DynamicProvider>{children}</DynamicProvider>
  </CookiesProvider>
);
