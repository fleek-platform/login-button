// TODO: We don't need server-side, neither "next" libraries
// Replace by vanilla version or other light option
import { deleteCookie, setCookie, getCookie } from 'cookies-next';
import type { OptionsType } from 'cookies-next/lib/types';
import { getTopLevelDomain } from '../utils/hostname';

// Refers to the application hostname
// during runtime
// TODO: Might want to get this as a prop instead
const domain = getTopLevelDomain(window.location.href);

export type AppCookies = 'authToken' | 'accessToken' | 'projectId';

const requiredAuthKeys: AppCookies[] = ['accessToken', 'authToken', 'projectId'];

export const cookies = {
  get: (key: AppCookies) => getCookie(key),
  // TODO: Add expiration
  // TODO: Add domain for cross domain use
  set: (key: AppCookies, value: string, options?: OptionsType) => 
    setCookie(key, value, {
      domain,
      ...options,
    }),
  reset: () => requiredAuthKeys.forEach(k => deleteCookie(k)),
  remove: (key: AppCookies) => deleteCookie(key),
};
