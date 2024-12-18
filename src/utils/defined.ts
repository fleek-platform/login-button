// LB__ prefix for login-button

export type Defined = {
  LB__GRAPHQL_API_URL?: string;
  LB__TEST_MODE?: string;
};

export const defined: Defined = {
  LB__GRAPHQL_API_URL: process.env.LB__GRAPHQL_API_URL as string,
  LB__TEST_MODE: process.env.LB__TEST_MODE as string,
};

const override_env_var_prefix = '';

export const getDefined = (key: keyof typeof defined): string => {
  const value = process?.env?.[`${override_env_var_prefix}${key}`] || defined[key];

  if (value === undefined || value === null) {
    throw new Error(`Expected key "${key}" to be defined but got ${typeof value}`);
  }

  if (typeof value !== 'string') {
    throw new Error(`Expected key "${key}" to be string but got ${typeof value}`);
  }

  return value;
};
