import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { loginWithDynamic } from '../graphql/fetchLoginWithDynamic';
import { setAuthCookie } from './authCookie';
import { initialAccessTokenState, useAuthStore } from '../store/authStore';

export const updateAccessTokenByProjectId = async (graphqlApiUrl: string, projectId?: string): Promise<string> => {
  const { setAccessTokenValue } = useAuthStore();
  const authToken = getAuthToken();

  const accessToken = authToken ? await loginWithDynamic(graphqlApiUrl, authToken, projectId) : initialAccessTokenState.value;
  setAuthCookie(accessToken);
  setAccessTokenValue(accessToken);

  return accessToken;
};
