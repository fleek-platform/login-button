import { deleteCookie, setCookie, getCookie } from 'cookies-next';
import type { OptionsType } from 'cookies-next/lib/types';

export type AppCookies = 'authToken' | 'accessToken' | 'projectId';

const requiredAuthKeys: AppCookies[] = ['accessToken', 'authToken', 'projectId'];

export const cookies = {
  get: (key: AppCookies) => getCookie(key),
  // TODO: Add expiration
  set: (key: AppCookies, value: string, options?: OptionsType) => 
    setCookie(key, value, options),
  reset: () => requiredAuthKeys.forEach(k => deleteCookie(k)),
  remove: (key: AppCookies) => deleteCookie(key),
};
