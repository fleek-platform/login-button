export interface SessionDetails {
  accessToken: string;
  projectId: string | null;
  __typename: 'SessionDetails';
}

export interface ProjectResponse {
  id: string;
  name: string;
}

interface GraphQLResponse<T> {
  data: {
    [key: string]: T;
  };
  errors?: Array<{ message: string }>;
}

type GraphQLVariables = {
  data?: {
    accessToken?: string;
    authToken?: string;
    projectId?: string;
  };
};

interface GraphQLOperation<Variables extends GraphQLVariables, Result> {
  operationName: string;
  query: string;
  variables?: Variables;
  dataField: keyof GraphQLResponse<Result>['data'];
}

type Errors = 'UNAUTHORIZED' | 'NETWORK_ERROR' | 'GRAPHQL_ERROR';

export type GraphQLError = {
  type: Errors;
  message: string;
};

export type ExecGraphQLOperationResult<Data> = { success: true; data: Data } | { success: false; error: GraphQLError };

const executeGraphQLOperation = async <Variables extends GraphQLVariables, Result>(
  graphqlApiUrl: string,
  operation: GraphQLOperation<Variables, Result>,
): Promise<ExecGraphQLOperationResult<Result>> => {
  try {
    const { operationName, query, variables } = operation;
    const body = JSON.stringify({
      operationName,
      query,
      variables,
    });

    console.log(`[debug] executeGraphQLOperation: graphql-client.ts: variables = ${JSON.stringify(variables)}`);

    const headers = (() => {
      const commonHeader = { 'Content-Type': 'application/json' };

      if (!variables?.data?.accessToken) {
        return commonHeader;
      }

      return {
        ...commonHeader,
        Authorization: `Bearer ${variables.data.accessToken}`,
      };
    })();

    console.log(`[debug] graphql-client.ts: headers = ${JSON.stringify(headers)}`);

    const response = await fetch(graphqlApiUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: {
            type: 'UNAUTHORIZED',
            message: 'You are not authorized to access this resource.',
          },
        };
      }

      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: 'Unexpected error. Repeat the action or contact support.',
        },
      };
    }

    const jsonRes: GraphQLResponse<Result> = await response.json();

    if (jsonRes?.errors?.[0]) {
      return {
        success: false,
        error: {
          type: 'GRAPHQL_ERROR',
          message: 'Unexpected error. Repeat the action or contact support.',
        },
      };
    }

    return {
      success: true,
      data: jsonRes.data[operation.dataField],
    };
  } catch (err) {
    console.error('Failed to execute GraphQL operation', err);
    return {
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        message: 'Failed to execute the operation. Please try again.',
      },
    };
  }
};

// TODO: We'd possibly want to use @fleek-platform/utils-genql-client since hard-typed queries will eventually fail on source change. The utils-genql-client is computed/generated.
export const loginWithDynamic = async (
  graphqlApiUrl: string,
  authToken: string,
  projectId?: string,
): Promise<ExecGraphQLOperationResult<string>> =>
  executeGraphQLOperation<{ data: { authToken: string; projectId?: string } }, string>(graphqlApiUrl, {
    operationName: 'loginWithDynamic',
    query: `
      mutation loginWithDynamic($data: LoginWithDynamicDataInput!) {
        loginWithDynamic(data: $data)
      }
    `,
    variables: { data: { authToken, projectId } },
    dataField: 'loginWithDynamic',
  });

// TODO: We'd possibly want to use @fleek-platform/utils-genql-client since hard-typed queries will eventually fail on source change. The utils-genql-client is computed/generated.
export const generateUserSessionDetails = async (
  graphqlApiUrl: string,
  authToken: string,
): Promise<ExecGraphQLOperationResult<SessionDetails>> =>
  executeGraphQLOperation<{ data: { authToken: string } }, SessionDetails>(graphqlApiUrl, {
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
    variables: { data: { authToken } },
    dataField: 'generateUserSessionDetails',
  });

export const me = async (graphqlApiUrl: string, accessToken: string): Promise<ExecGraphQLOperationResult<SessionDetails>> =>
  executeGraphQLOperation<{ data: { accessToken: string } }, SessionDetails>(graphqlApiUrl, {
    operationName: 'me',
    query: `
      query me {
        user {
          id
          avatar
          username
          firstName
          email
          walletAddress
        }
      }
    `,
    variables: { data: { accessToken } },
    dataField: 'me',
  });

type ProjectWhereInput = {
  id: string;
};

export const project = async (
  graphqlApiUrl: string,
  accessToken: string,
  projectId: string,
): Promise<ExecGraphQLOperationResult<ProjectResponse>> =>
  executeGraphQLOperation<{ data: { accessToken: string }; where: { id: string } }, ProjectResponse>(graphqlApiUrl, {
    operationName: 'project',
    query: `
      query project($where: ProjectWhereInput!) {
        project(where: $where) {
          id
          name
        }
      }
    `,
    variables: {
      data: {
        accessToken,
      },
      where: {
        id: projectId,
      },
    },
    dataField: 'project',
  });
