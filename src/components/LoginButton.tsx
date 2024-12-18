// 'use client';

import { FC } from 'react';

import Button from '@/components/Button';
import { CookiesContext } from '@/providers/CookiesProvider';
// import { Providers } from '@/providers/Providers';

type Props = {
  requestCookies?: CookiesContext['values'];
};

// todo: something from Providers fails with "use client"

const LoginButton: FC<Props> = ({ requestCookies }) => {
  return (
    // <Providers requestCookies={requestCookies}>
    <Button>Login with Dynamic</Button>
    // </Providers>
  );
};

export default LoginButton;
