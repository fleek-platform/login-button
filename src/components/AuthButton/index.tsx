import type { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';
import type { LoginProviderChildrenProps } from '../../providers/LoginProvider';
import { AuthDropdown } from './AuthDropdown';

export interface AuthButtonProps<T> extends LoginProviderChildrenProps {
  text?: {
    default?: string;
    loading?: string;
    error?: string;
    loggedIn?: string;
  };
  ButtonComponent?: T;
  dropdown?: boolean;
  children?: ReactNode;
}

export const AuthButton = <T extends ElementType = 'button'>({
  accessToken,
  isLoading,
  error,
  login,
  logout,
  text,
  ButtonComponent,
  dropdown,
  children,
  ...props
}: AuthButtonProps<T> & ComponentPropsWithoutRef<T>) => {
  const Button = ButtonComponent || 'button';

  const handleClick = () => (accessToken ? logout() : login());

  if (dropdown && accessToken) {
    return <AuthDropdown logout={logout}>{children}</AuthDropdown>;
  }

  // Default button texts
  const defaultText = text?.default || 'Login';
  const loadingText = text?.loading || 'Loading...';
  const errorText = text?.error || 'Login failed';
  const loggedInText = text?.loggedIn || 'Log out';

  // Determine the displayed text
  let buttonText = defaultText;
  if (isLoading) buttonText = loadingText;
  if (error) buttonText = errorText;
  if (accessToken) buttonText = loggedInText;

  // If not authenticated, render the simple button
  return (
    <Button onClick={handleClick} disabled={isLoading} {...props}>
      {buttonText}
    </Button>
  );
};
