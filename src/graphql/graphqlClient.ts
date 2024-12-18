import { Client, createClient, LoginWithDynamicDataInput } from '@fleek-platform/utils-genql-client';
import { graphqlFetcher } from '@/graphql/graphqlFetcher';
import { getDefined } from '@/utils/defined';

type GraphqlClientOptions = {
  graphqlServiceApiUrl?: string;
};

const graphqlApiUrl = getDefined('LB__GRAPHQL_API_URL');

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

  public loginWithDynamic = async (data: LoginWithDynamicDataInput): Promise<string> => {
    const response = await this.graphqlClient.mutation({
      __name: 'LoginWithDynamic',
      loginWithDynamic: {
        __args: {
          data,
        },
      },
    });

    return response.loginWithDynamic;
  };
}
