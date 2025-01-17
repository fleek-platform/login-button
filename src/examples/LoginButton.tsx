'use client';

import React, { type FC } from 'react';

import Button from './components/Button';
import { LoginProvider } from '../providers/LoginProvider';

// Staging
const graphqlApiUrl = 'https://graphql.service.staging.fleeksandbox.xyz/graphql';
const dynamicEnvironmentId = 'c4d4ccad-9460-419c-9ca3-494488f8c892';

// example usage
const LoginButton = () => {
  const paragraphStyles = {
    maxWidth: '16rem',
    wordBreak: 'break-word',
    marginTop: '1rem',
  } as const;

  return (
    <LoginProvider
      graphqlApiUrl={graphqlApiUrl}
      dynamicEnvironmentId={dynamicEnvironmentId}
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
