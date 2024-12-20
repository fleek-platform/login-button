'use client';

import { FC } from 'react';

import Button from '@/components/Button';
import { CookiesContext } from '@/providers/CookiesProvider';
import { Providers } from '@/providers/Providers';

type Props = {
  requestCookies?: CookiesContext['values'];
};

const LoginButton: FC<Props> = ({ requestCookies }) => {
  return (
    <Providers requestCookies={requestCookies}>
      {({ login, logout, accessToken, isLoading, error }) => {
        const handleClick = () => {
          if (accessToken) logout();
          else login();
        };

        const buttonText = error ? 'Login failed' : isLoading ? 'Loading...' : 'Login with Dynamic';

        return (
          <>
            <Button onClick={handleClick}>{buttonText}</Button>
            {accessToken && <p className="max-w-64 break-words">accessToken: {accessToken}</p>}
          </>
        );
      }}
    </Providers>
  );
};

export default LoginButton;
