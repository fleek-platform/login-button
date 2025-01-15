import {  getCookies } from 'cookies-next';

type AuthCookieType = { accessToken?: string }

/** Util method independent of cookie provider. */
export const getAuthCookie = (): string | undefined => {
  const cookies = getCookies() as AuthCookieType;
  const authCookie = cookies?.accessToken

  return authCookie;
};
