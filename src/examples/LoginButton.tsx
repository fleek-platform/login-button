'use client';

import React, { type FC } from 'react';

import Button from './components/Button';
import { LoginProvider } from '../providers/LoginProvider';

// example usage
const LoginButton = () => {
  const paragraphStyles = {
    maxWidth: '16rem',
    wordBreak: 'break-word',
    marginTop: '1rem',
  } as const;

  return (
    <LoginProvider
      graphqlApiUrl="https://example.com/graphql"
      environmentId="my-env-id"
    >
      {(props) => {
        const { login, logout, accessToken, isLoading, error } = props;

        const handleClick = () => {
          if (accessToken) {
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
          // not real session, session is in the cookie, just for demo
          case Boolean(accessToken):
            buttonText = 'Log out';
            break;
        }

        return (
          <>
            <Button onClick={handleClick}>{buttonText}</Button>
            {accessToken && <p style={paragraphStyles}>accessToken: {accessToken}</p>}
          </>
        );
      }}
    </LoginProvider>
  );
};

export default LoginButton;
