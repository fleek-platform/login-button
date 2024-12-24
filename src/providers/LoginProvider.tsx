import { FC } from 'react';

import { CookiesContext, CookiesProvider } from '../providers/CookiesProvider';
import { DynamicProvider, DynamicProviderProps } from '../providers/DynamicProvider';

export type LoginProviderProps = {
  requestCookies?: CookiesContext['values'];
} & DynamicProviderProps;

// main component to publish
const LoginProvider: FC<LoginProviderProps> = ({ children, requestCookies }) => (
  <CookiesProvider requestCookies={requestCookies}>
    <DynamicProvider>{children}</DynamicProvider>
  </CookiesProvider>
);

export default LoginProvider;
