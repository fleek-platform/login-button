// LB__ prefix for login-button

export type Defined = {
  NEXT_PUBLIC_LB__GRAPHQL_API_URL?: string;
  NEXT_PUBLIC_LB__DYNAMIC_ENVIRONMENT_ID?: string;
};

export const defined: Defined = {
  NEXT_PUBLIC_LB__GRAPHQL_API_URL: process.env.NEXT_PUBLIC_LB__GRAPHQL_API_URL as string,
  NEXT_PUBLIC_LB__DYNAMIC_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_LB__DYNAMIC_ENVIRONMENT_ID as string,
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
