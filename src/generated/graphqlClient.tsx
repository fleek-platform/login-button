import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: any;
  CID: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: any;
  File: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
};

/*-------------------------- generateUserSessionDetails ------------------------*/
// manually reconstructed

/** Session details containing access token and project ID */
export interface SessionDetails {
  /** The JWT access token */
  accessToken: Scalars['String']
  /** The last modified project ID */
  projectId: (Scalars['String'] | null)
  __typename: 'SessionDetails'
}

export interface GenerateUserSessionDetailsDataInput {authToken: Scalars['String']}

export type Mutation = {
  loginWithDynamic: Scalars['String'];
  generateUserSessionDetails: SessionDetails
}

export type MutationGenerateUserSessionDetailsArgs = {
  data: GenerateUserSessionDetailsDataInput;
};

export type GenerateUserSessionDetailsMutationVariables = Exact<{
  data: GenerateUserSessionDetailsDataInput;
}>;

export type GenerateUserSessionDetailsMutation = {
  __typename?: 'Mutation';
  generateUserSessionDetails: SessionDetails;
};

export const GenerateUserSessionDetailsDocument = gql`
mutation generateUserSessionDetails($data: GenerateUserSessionDetailsDataInput!) {
  generateUserSessionDetails(data: $data)
}
`;

export function useGenerateUserSessionDetailsMutation() {
  return Urql.useMutation<
  GenerateUserSessionDetailsMutation,
  GenerateUserSessionDetailsMutationVariables
  >(GenerateUserSessionDetailsDocument);
}

/*-------------------------------- loginWithDynamic ------------------------------*/
// unused, for reference

export type LoginWithDynamicDataInput = {
  authToken: Scalars['String'];
  projectId?: InputMaybe<Scalars['ID']>;
};

export type MutationLoginWithDynamicArgs = {
  data: LoginWithDynamicDataInput;
};

export type LoginWithDynamicMutationVariables = Exact<{
  data: LoginWithDynamicDataInput;
}>;

export type LoginWithDynamicMutation = {
  __typename?: 'Mutation';
  loginWithDynamic: string;
};

export const LoginWithDynamicDocument = gql`
mutation loginWithDynamic($data: LoginWithDynamicDataInput!) {
  loginWithDynamic(data: $data)
}
`;

export function useLoginWithDynamicMutation() {
  return Urql.useMutation<
    LoginWithDynamicMutation,
    LoginWithDynamicMutationVariables
  >(LoginWithDynamicDocument);
}

