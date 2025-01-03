import { DateTime } from 'luxon';
import { decodeAccessToken } from '@fleek-platform/utils-token';
import { useCookies } from '../providers/CookiesProvider';
import { Log } from '../utils/log';

const key = 'accessToken';

export const useAuthCookie = (): [string | undefined, (value: string) => void, () => void] => {
  const cookies = useCookies();

  const set = (jwt: string) => {
    try {
      const parsed = decodeAccessToken({ token: jwt });

      cookies.set(key, jwt, { expires: DateTime.fromSeconds(parsed.exp).toJSDate() });
    } catch (error) {
      Log.error('Failed to set access token', error);
    }
  };

  const remove = () => {
    cookies.remove(key);
  };

  return [cookies.values[key], set, remove];
};
