// ! this import breaks
import { Client, createClient, GenerateUserSessionDetailsDataInput, SessionDetails } from '@fleek-platform/utils-genql-client';

import { graphqlFetcher } from '@/graphql/graphqlFetcher';
import { getDefined } from '@/utils/defined';

type GraphqlClientOptions = {
  graphqlServiceApiUrl?: string;
};

const graphqlApiUrl = getDefined('NEXT_PUBLIC_LB__GRAPHQL_API_URL');

export class GraphqlClient {
  private graphqlClient: Client;
  private graphqlServiceApiUrl: string;

  constructor({ graphqlServiceApiUrl = graphqlApiUrl }: GraphqlClientOptions) {
    this.graphqlClient = createClient({
      fetcher: async (operation) =>
        graphqlFetcher({
          operation,
          headers: {},
          endpoint: this.graphqlServiceApiUrl,
        }),
    });

    this.graphqlServiceApiUrl = graphqlServiceApiUrl;
  }

  public generateUserSessionDetails = async (data: GenerateUserSessionDetailsDataInput): Promise<SessionDetails> => {
    const response = await this.graphqlClient.mutation({
      __name: 'GenerateUserSessionDetails',
      generateUserSessionDetails: {
        __args: {
          data,
        },
        __scalar: true,
      },
    });

    return response.generateUserSessionDetails;
  };
}
