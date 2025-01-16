import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { loginWithDynamic } from '../graphql/fetchLoginWithDynamic';
import { setAuthCookie } from './authCookie';
import { initialAuthState, useAuthStore } from '../store/authStore';

export const updateAccessTokenByProjectId = async (graphqlApiUrl: string, projectId?: string): Promise<string> => {
  const { setAccessToken } = useAuthStore();
  const authToken = getAuthToken();

  const accessToken = authToken ? await loginWithDynamic(graphqlApiUrl, authToken, projectId) : initialAuthState.accessToken;
  setAuthCookie(accessToken);
  setAccessToken(accessToken);

  return accessToken;
};
