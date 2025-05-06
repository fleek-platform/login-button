# @fleek-platform/login-button

## 2.12.0

### Minor Changes

- d6c96f1: Assess login state from dynamic hook

## 2.11.0

### Minor Changes

- b1d4cb6: Remove selected state on click

## 2.10.2

### Patch Changes

- 764a572: Adds reusable component AuthButton off-loading most of the logic, also includes an option for dropdown version

## 2.10.1

### Patch Changes

- ce5df46: On wallet connect users cannot type email address

## 2.10.0

### Minor Changes

- 73bcc00: On mobile, position login modal at the top

## 2.9.0

### Minor Changes

- 3b1ad6d: On access token expiration, create a new token and update cookie

## 2.8.0

### Minor Changes

- 383b946: If token expired, invalidate user session

## 2.7.3

### Patch Changes

- dd58f3e: Dismiss network errors on Me checkups

## 2.7.2

### Patch Changes

- 14e25a2: Do a Me checkup on load

## 2.7.1

### Patch Changes

- 25a8ec5: Invalid user access token validation

## 2.7.0

### Minor Changes

- 94b67c1: Validate token via me endpoint during user session validation

## 2.6.0

### Minor Changes

- 60df314: Prevent in-memory Project ID cookie mismatch dismiss user session

## 2.5.0

### Minor Changes

- 93cd943: expose user avatar from the auth store

## 2.4.0

### Minor Changes

- 5027789: Enhance session dismissal checks by clearing session on faulty data, e.g. unknown project id, missing cookie access token

## 2.3.0

### Minor Changes

- 77c2737: Deprecate dataField from graphql client

## 2.2.0

### Minor Changes

- 63d5d14: Introduces a on authentication callback

## 2.1.0

### Minor Changes

- 7ed2bec: Prevent faulty user sessions

## 2.0.9

### Patch Changes

- 3ac0730: Amend generated local package pathname in copy and paste command

## 2.0.8

### Patch Changes

- a3ed9fe: Adds minimum versions for engines

## 2.0.7

### Patch Changes

- 2fee2fc: Fix clearing of storage on logout

## 2.0.6

### Patch Changes

- cebf203: Add missing css overrides for login modal

## 2.0.5

### Patch Changes

- 10e0e88: Fixes re-send code button font-size and fixes LoginProvider not re-rendering on isLoading change

## 2.0.4

### Patch Changes

- 1aa1cea: Bump version, workflow test only

## 2.0.3

### Patch Changes

- 6297860: Replace CSS scale with em based size overrides

## 2.0.2

### Patch Changes

- 76cff37: Bump version for workflow test only

## 2.0.1

### Patch Changes

- c070cbd: Make DynamicUtils return nullish

## 2.0.0

### Major Changes

- ca8a8f7: Introduce global store, re-architect, etc

### Minor Changes

- c003107: Clear storage by matching term, e.g. dynamic
- 9499ce0: expose user profile data

## 1.0.10

### Patch Changes

- 3754bd7: Test changeset Github Actions workflow

## 1.0.1

### Patch Changes

- Change from commonjs to esm to fix loading in Next.js app

## 1.0.0

### Major Changes

- Initial release of the login button with Dynamic that sets accessToken as a cookie.
