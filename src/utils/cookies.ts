// TODO: We don't need server-side, neither "next" libraries
// Replace by vanilla version or other light option
import { getTopLevelDomain } from '../utils/hostname';
import { isClient } from '../utils/browser';

type CookieOptions = {
  domain?: string;
  path?: string;
  expires?: Date | number;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

// Refers to the application hostname
// during runtime
// TODO: Might want to get this as a prop instead
const domain = isClient ? getTopLevelDomain(window.location.href) : '';

const defaultOptions: CookieOptions = {
  domain,
  path: '/',
};

export type AppCookies = 'authToken' | 'accessToken' | 'projectId';

const requiredAuthKeys: AppCookies[] = ['accessToken', 'authToken', 'projectId'];

const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (opts.path) cookie += `; path=${opts.path}`;
  if (opts.domain) cookie += `; domain=${opts.domain}`;
  if (opts.maxAge) cookie += `; max-age=${opts.maxAge}`;
  if (opts.expires) cookie += `; expires=${new Date(opts.expires).toUTCString()}`;
  if (opts.secure) cookie += '; secure';
  if (opts.sameSite) cookie += `; samesite=${opts.sameSite}`;

  document.cookie = cookie;
};

const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
};

const deleteCookie = (name: string, options: CookieOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  setCookie(name, '', {
    ...opts,
    expires: new Date(0),
  });
};

export const cookies = {
  get: (key: AppCookies) => getCookie(key),
  // TODO: Add expiration
  // TODO: Add domain for cross domain use
  set: (key: AppCookies, value: string, options?: CookieOptions) =>
    setCookie(key, value, {
      ...defaultOptions,
      ...options,
    }),
  reset: () => {
    for (const key of requiredAuthKeys) {
      deleteCookie(key, defaultOptions);
    }
  },
  remove: (key: AppCookies) => deleteCookie(key, defaultOptions),
};
