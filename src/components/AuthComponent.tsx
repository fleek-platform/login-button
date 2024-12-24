import { FC, ReactNode } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { AccessTokenResult } from '../providers/DynamicProvider';

export type ChildrenProps = {
  login: () => void;
  logout: () => void;
} & AccessTokenResult;

export type AuthComponentProps = {
  accessTokenResult: AccessTokenResult;
  children: (props: ChildrenProps) => ReactNode;
};

export const AuthComponent: FC<AuthComponentProps> = ({ children, accessTokenResult }) => {
  const dynamic = useDynamicContext();

  const login = () => dynamic.setShowAuthFlow(true);
  const logout = () => dynamic.handleLogOut();

  return <>{children({ ...accessTokenResult, login, logout })}</>;
};
