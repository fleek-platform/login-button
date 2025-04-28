import { decodeAccessToken as decodeToken } from '@fleek-platform/utils-token';

export const decodeAccessToken = (accessToken: string) => {
  // TODO: Ask user to get project id from host app
  // instead of providing here?
  // For the moment we provide this for free
  // everytime the token is computed to help
  const { projectId, exp } = decodeToken({
    token: accessToken,
  });

  if (!projectId) {
    throw Error(`Expected accessToken to include a project ID, but found ${typeof projectId}`);
  }

  return {
    projectId,
    exp,
  };
};

export const truncateMiddle = (str: string, numOfChars = 3, ellipsis = '...'): string => {
  const start = str.substring(0, numOfChars);
  const end = str.slice(-numOfChars);

  return `${start}${ellipsis}${end}`;
};

export const isTokenExpired = (exp: number): boolean => {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  return currentTimestamp >= exp;
};
