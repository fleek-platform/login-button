import { decodeAccessToken as decodeToken } from '@fleek-platform/utils-token';

export const decodeAccessToken = (accessToken: string) => {
  // TODO: Ask user to get project id from host app
  // instead of providing here?
  // For the moment we provide this for free
  // everytime the token is computed to help
  const { projectId } = decodeToken({
    token: accessToken,
  });

  if (!projectId) {
    throw Error(`Expected accessToken to include a project ID, but found ${typeof projectId}`);
  }

  return projectId;
}
