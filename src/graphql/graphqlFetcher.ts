import { UnauthorizedError, UnknownError } from '@fleek-platform/errors';
import * as errors from '@fleek-platform/errors';
import { File } from '@web-std/file';
import { FormData } from '@web-std/form-data';
import { traverse } from 'object-traversal';

export type GraphqlOperation = {
  query: string;
  variables?: { [name: string]: any };
  operationName?: string;
};

type GraphqlFetcherArgs = {
  operation: GraphqlOperation | GraphqlOperation[];
  endpoint: string;
  headers: Record<string, unknown>;
};

export const graphqlFetcher = async ({ endpoint, headers, operation }: GraphqlFetcherArgs) => {
  const map: string[] = [];
  const files: (typeof File)['prototype'][] = [];

  // todo: remove probably
  traverse(operation, ({ parent, key, value, meta }) => {
    if (parent && key && meta.nodePath && Object.prototype.toString.call(value) === '[object File]') {
      map.push(meta.nodePath);
      files.push(value);

      parent[key] = null;
    }
  });

  const body = new FormData();
  body.append('operations', JSON.stringify(operation));
  body.append('map', JSON.stringify(Object.fromEntries(map.map((path, index) => [`${index}`, [path]]))));

  files.forEach((file, index) => body.append(`${index}`, file));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    body: body,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new UnauthorizedError({});
    }

    // TODO: Create a custom error for response not ok
    throw new UnknownError();
  }

  const data = await response.json();
  const error = data?.errors?.[0];

  if (!error) {
    return data;
  }

  if ('extensions' in error) {
    const errorClass: typeof Error = (errors as any)?.[error.extensions.name];

    if (errorClass) {
      throw new errorClass(error.extensions.data);
    }
  }

  throw new UnknownError();
};
