'use client';

import { FC } from 'react';

import Button from '@/components/ui/Button';
import { CookiesContext } from '@/providers/CookiesProvider';
import { LoginProvider } from '@/providers/LoginProvider';

type Props = {
  requestCookies?: CookiesContext['values'];
};

// example usage
const LoginButton: FC<Props> = ({ requestCookies }) => {
  return (
    <LoginProvider requestCookies={requestCookies}>
      {(props) => {
        const { login, logout, accessToken, isLoading, error } = props;

        const handleClick = () => {
          if (Boolean(accessToken)) {
            logout();
          } else {
            login();
          }
        };

        let buttonText = 'Login with Dynamic';

        switch (true) {
          case Boolean(error):
            buttonText = 'Login failed';
            break;
          case isLoading:
            buttonText = 'Loading...';
            break;
          case Boolean(accessToken):
            buttonText = 'Log out';
            break;
        }

        return (
          <>
            <Button onClick={handleClick}>{buttonText}</Button>
            {accessToken && <p className="max-w-64 break-words mt-4">accessToken: {accessToken}</p>}
          </>
        );
      }}
    </LoginProvider>
  );
};

export default LoginButton;
