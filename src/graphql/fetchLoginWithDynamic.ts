import { UnauthorizedError, UnknownError } from '@fleek-platform/errors';
import * as errors from '@fleek-platform/errors';

export const loginWithDynamic = async (graphqlApiUrl: string, authToken: string, projectId?: string): Promise<string> => {
  const response = await fetch(graphqlApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operationName: 'loginWithDynamic',
      query: `
        mutation loginWithDynamic($data: LoginWithDynamicDataInput!) {
            loginWithDynamic(data: $data)
        }
        `,
      variables: {
        data: { authToken, projectId },
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new UnauthorizedError({});
    }

    throw new UnknownError();
  }

  const jsonResponse = await response.json();
  const error = jsonResponse?.errors?.[0];

  if (!error) {
    const accessToken: string = jsonResponse.data.loginWithDynamic;
    return accessToken;
  }

  if ('extensions' in error) {
    // biome-ignore lint: Enable any for error handling
    const errorClass: typeof Error = (errors as any)?.[error.extensions.name];

    if (errorClass) {
      throw new errorClass(error.extensions.data);
    }
  }

  throw new UnknownError();
};
