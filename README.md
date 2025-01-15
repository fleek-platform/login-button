![](.repo/images/repo/banner.png?202409201714)

# ⚡️Fleek Login Button

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The Fleek Login Button provides standalone authentication button component with an embedded modal that functions independently of host application.

`authToken` obtained via [Dynamic](https://docs.dynamic.xyz/react-sdk/overview) dialog is exchanged for an `accessToken` using the `generateUserSessionDetails` mutation. The `accessToken` is then stored as a cookie with the same name. Any app under the hostname can read the cookie and use it to perform GraphQL requests.

## Overview

- [🤖 Install](#install)
- [👷‍♀️Development](#development)
  - [Code format](#code-format)
  - [Changeset](#changeset)
- [🧸 Basic Usage](#basic-usage)
  - [Reading auth cookie](#reading-auth-cookie)
- [📋 Additional Notes](#additional-notes)
- [📖 Docs](https://fleek.xyz/docs/sdk)
- [🙏 Contributing](#contributing)
  - [Branching strategy](#branching-strategy)
  - [Contributing](#conventional-commits)
- [⏱️ Changelog](./CHANGELOG.md)

## Requirements

- Nodejs as runtime
- NPM, Yarn to install the SDK, or PNPM for development
- Familiarity with Nodejs, Frontend/Client side development

## Install

Install the package by executing:

```sh
npm i @fleek-platform/login-button
```

⚠️ If you're planning to contribute as a developer, you must install [pnpm](https://pnpm.io), otherwise most commands will fail.

For a quick start, learn the [basic usage](#basic-usage).

## Development

For developers looking to contribute to the `@fleek-platform/login-button`, [clone](https://github.com/fleekxyz/login-button) the repository and follow the [contribution guide](#contributing).

For runtime we utilize [Nodejs](https://nodejs.org/en/download) and [PNPM](https://pnpm.io/installation) as the package manager.

Next, install the project dependencies:

```sh
pnpm i
```

### Changeset

Manage the versioning of changelog entries.

Declare an intent to release by executing the command and answering the wizard's questions:

```sh
pnpm changeset:add
```

## Basic usage

Make use of the exported `LoginProvider` component. Exposed props are: `login`, `logout`, `accessToken`, `isLoading` and `error`.

You need to set the following required props:

```tsx
<LoginProvider
  graphqlApiUrl="..."
  environmentId="..."
  //...
/>
```

Example usage:

```tsx
import { LoginProvider } from '@fleek-platform/login-button';

<LoginProvider
  graphqlApiUrl="https://example.com/graphql"
  environmentId="my-env-id"
  requestCookies={requestCookies}
  //
>
  {(props) => {
    const { login, logout, accessToken, isLoading, error } = props;

    const handleClick = () => {
      if (Boolean(accessToken)) {
        logout();
      } else {
        login();
      }
    };

    let buttonText = 'Login with Dynamic';

    switch (true) {
      case Boolean(error):
        buttonText = 'Login failed';
        break;
      case isLoading:
        buttonText = 'Loading...';
        break;
      // not a real session, session is in the cookie, just for demo
      case Boolean(accessToken):
        buttonText = 'Log out';
        break;
    }

    return (
      <>
        <Button onClick={handleClick}>{buttonText}</Button>
        {accessToken && <p className="max-w-64 break-words mt-4">accessToken: {accessToken}</p>}
      </>
    );
  }}
</LoginProvider>;
```

### Reading auth cookie

To read auth cookie value at any point `getAuthCookie()` utility is exposed. Auth cookie uses `accessToken` key.

```ts
import { getAuthCookie } from '@fleek-platform/login-button';

const accessToken: string | undefined = getAuthCookie();
```

## Additional notes

Currently the `generateUserSessionDetails` mutation is called using a simple `fetch` call in [fetchGenerateUserSessionDetails.ts](src/graphql/fetchGenerateUserSessionDetails.ts) due to the fact that `@fleek-platform/utils-genql-client` package breaks the build. Once the issue is resolved, the existing implementation should be restored from this point in Git history [commit](https://github.com/fleek-platform/login-button/tree/5922518804e9cac498db5b23d5c7be5e191dbabe).

## Contributing

This section guides you through the process of contributing to our open-source project. From creating a feature branch to submitting a pull request, get started by:

1. Fork the project [here](https://github.com/fleekxyz/cli)
2. Create your feature branch using our [branching strategy](#branching-strategy), e.g. `git checkout -b feat/my-new-feature`
3. Run the tests: `pnpm test`
4. Commit your changes by following our [commit conventions](#conventional-commits), e.g. `git commit -m 'chore: 🤖 my contribution description'`
5. Push to the branch, e.g. `git push origin feat/my-new-feature`
6. Create new Pull Request following the corresponding template guidelines

### Branching strategy

The develop branch serves as the main integration branch for features, enhancements, and fixes. It is always in a deployable state and represents the latest development version of the application.

Feature branches are created from the develop branch and are used to develop new features or enhancements. They should be named according to the type of work being done and the scope of the feature and in accordance with conventional commits [here](#conventional-commits).

### Conventional commits

We prefer to commit our work following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0) conventions. Conventional Commits are a simple way to write commit messages that both people and computers can understand. It help us keep track fo changes in a consistent manner, making it easier to see what was added, changed, or fixed in each commit or update.

The commit messages are formatted as **[type]/[scope]**
The **type** is a short descriptor indicating the nature of the work (e.g., feat, fix, docs, style, refactor, test, chore). This follows the conventional commit types.

The **scope** is a more detailed description of the feature or fix. This could be the component or part of the codebase affected by the change.

Here's an example of different conventional commits messages that you should follow:

```txt
test: 💍 Adding missing tests
feat: 🎸 A new feature
fix: 🐛 A bug fix
chore: 🤖 Build process or auxiliary tool changes
docs: 📝 Documentation only changes
refactor: 💡 A code change that neither fixes a bug or adds a feature
style: 💄 Markup, white-space, formatting, missing semi-colons...
```
