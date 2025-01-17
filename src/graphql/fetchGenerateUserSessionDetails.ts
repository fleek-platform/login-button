export interface SessionDetails {
  accessToken: string;
  projectId: string | null;
  __typename: 'SessionDetails';
}

// Note: replace this with @fleek-platform/utils-genql-client when that package gets fixed (currently it breaks the build)

export const generateUserSessionDetails = async (graphqlApiUrl: string, authToken: string): Promise<SessionDetails> => {
  const response = await fetch(graphqlApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operationName: 'generateUserSessionDetails',
      query: `
            mutation generateUserSessionDetails($data: GenerateUserSessionDetailsDataInput!) {
              generateUserSessionDetails(data: $data) {
                accessToken
                projectId
                __typename
              }
            }
          `,
      variables: {
        data: { authToken },
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
    const sessionDetails: SessionDetails = jsonResponse.data.generateUserSessionDetails;
    return sessionDetails;
  }

  throw new Error('Unexpected error. Repeat the action or contact support.');
};
