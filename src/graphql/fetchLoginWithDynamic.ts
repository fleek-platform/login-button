// TODO: This method body seems very similar
// to fetchGenerateUserSession. Seems we can have a fabric
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
      throw new Error('You are not authorized to access this resource.');
    }

    throw new Error('Unexpected error. Repeat the action or contact support.');
  }

  const jsonResponse = await response.json();
  const error = jsonResponse?.errors?.[0];

  if (!error) {
    const accessToken: string = jsonResponse.data.loginWithDynamic;
    return accessToken;
  }

  throw new Error('Unexpected error. Repeat the action or contact support.');
};
