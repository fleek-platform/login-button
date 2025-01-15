import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { loginWithDynamic } from '../graphql/fetchLoginWithDynamic';
import { setAuthCookie } from './authCookie';

export const updateAccessToken = async (graphqlApiUrl: string, projectId?: string): Promise<string> => {
  let accessToken = '';

  const authToken = getAuthToken();
  if (!authToken) {
    setAuthCookie(accessToken);
    return accessToken;
  }

  // let the host handle exception
  accessToken = await loginWithDynamic(graphqlApiUrl, authToken, projectId);
  setAuthCookie(accessToken);

  return accessToken;
};
