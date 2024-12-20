import { getDefined } from '@/utils/defined';

const graphqlApiUrl = getDefined('NEXT_PUBLIC_LB__GRAPHQL_API_URL');

export interface SessionDetails {
  accessToken: string;
  projectId: string | null;
  __typename: 'SessionDetails';
}

export const generateUserSessionDetails = async (authToken: string): Promise<SessionDetails> => {
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
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const jsonResponse = await response.json();
  const sessionDetails: SessionDetails = jsonResponse.data.generateUserSessionDetails;

  return sessionDetails;
};
