export type Defined = {
  PUBLIC_GRAPHQL_API_URL?: string;
  PUBLIC_DYNAMIC_ENVIRONMENT_ID?: string;
  PUBLIC_APP_HOSTING_URL?: string;
  PUBLIC_APP_AGENTS_URL?: string;
};

export const defined: Defined = {
  PUBLIC_GRAPHQL_API_URL: process.env.PUBLIC_GRAPHQL_API_URL,
  PUBLIC_DYNAMIC_ENVIRONMENT_ID: process.env.PUBLIC_DYNAMIC_ENVIRONMENT_ID,
  PUBLIC_APP_HOSTING_URL: process.env.PUBLIC_APP_HOSTING_URL,
  PUBLIC_APP_AGENTS_URL: process.env.PUBLIC_APP_AGENTS_URL,
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

// Use to override `defined`
export const setDefined = (settings: Partial<Defined>) => {
  const override = { ...defined, ...settings };
  Object.assign(defined, override);
};
