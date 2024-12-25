import { UnauthorizedError, UnknownError } from '@fleek-platform/errors';
import * as errors from '@fleek-platform/errors';
import { getDefined } from '../utils/defined';

export interface SessionDetails {
  accessToken: string;
  projectId: string | null;
  __typename: 'SessionDetails';
}

// Note: replace this with @fleek-platform/utils-genql-client when that package gets fixed (currently it breaks the build)

export const generateUserSessionDetails = async (
  authToken: string,
  graphqlApiUrl = getDefined('NEXT_PUBLIC_LB__GRAPHQL_API_URL'),
): Promise<SessionDetails> => {
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
      throw new UnauthorizedError({});
    }

    throw new UnknownError();
  }

  const jsonResponse = await response.json();
  const error = jsonResponse?.errors?.[0];

  if (!error) {
    const sessionDetails: SessionDetails = jsonResponse.data.generateUserSessionDetails;
    return sessionDetails;
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
