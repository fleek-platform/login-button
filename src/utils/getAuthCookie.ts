import {  getCookies } from 'cookies-next';
import { isServerSide } from './isServerSide';
import type { CookiesContext } from '../providers/CookiesProvider';

/** Util method independent of cookie provider. */
export const getAuthCookie = (requestCookies?: CookiesContext['values'] ): string | undefined => {
  const cookies = isServerSide() ? requestCookies : (getCookies() as CookiesContext['values']);
  const authCookie = cookies?.accessToken

  return authCookie;
};
