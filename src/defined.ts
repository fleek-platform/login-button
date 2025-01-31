export type Defined = {
  PUBLIC_GRAPHQL_API_URL?: string;
  PUBLIC_DYNAMIC_ENVIRONMENT_ID?: string;
};

export const defined: Defined = {
  PUBLIC_GRAPHQL_API_URL: process.env.PUBLIC_GRAPHQL_API_URL,
  PUBLIC_DYNAMIC_ENVIRONMENT_ID: process.env.PUBLIC_DYNAMIC_ENVIRONMENT_ID,
};

export const getDefined = (key: keyof typeof defined): string => {
  const value = defined[key];

  if (value === undefined || value === null) {
    throw new Error(`Expected key "${key}" to be defined but got ${typeof value}`);
  }

  if (typeof value !== 'string') {
    throw new Error(`Expected key "${key}" to be string but got ${typeof value}`);
  }

  return value;
};
