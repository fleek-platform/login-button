import { getCookies, setCookie } from 'cookies-next';
import { isServerSide } from './isServerSide';
import { CookiesError } from '../providers/CookiesProvider';

type AuthCookieType = { accessToken?: string };

/** Util method independent of cookie provider. */
export const getAuthCookie = (): string | undefined => {
  const cookies = getCookies() as AuthCookieType;
  const authCookie = cookies?.accessToken;

  return authCookie;
};

export const setAuthCookie = (value: string): void => {
  if (isServerSide()) throw new CookiesError('Server side is not allowed to set cookies');

  setCookie('accessToken', value);
};
