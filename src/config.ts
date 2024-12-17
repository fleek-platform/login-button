export const config = {
  TEST_MODE: Boolean(process.env.NEXT_PUBLIC_TEST_MODE),
  SDK__GRAPHQL_API_URL: process.env.SDK__GRAPHQL_API_URL,
};
