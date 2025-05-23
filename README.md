![](.repo/images/repo/banner.png?202409201714)

# ⚡️Fleek Login Button

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The Fleek Login Button provides standalone authentication button component with an embedded modal that functions independently of host application.

`authToken` obtained via [Dynamic](https://docs.dynamic.xyz/react-sdk/overview) dialog is exchanged for an `accessToken` using the `generateUserSessionDetails` mutation. The `accessToken` is then stored as a cookie with the same name. Any app under the hostname can read the cookie and use it to perform GraphQL requests.

## Overview

- [🤖 Install](#install)
- [👷‍♀️Development](#development)
  - [Environment Variables](#environment-variables)
  - [Local Package Test](#local-package-test)
  - [Code format](#code-format)
  - [Changeset](#changeset)
- [🧸 Basic Usage](#basic-usage)
  - [Reading auth cookie](#reading-auth-cookie)
- [📋 Additional Notes](#additional-notes)
- [📖 Docs](https://fleek.xyz/docs/sdk)
- [🚀 Package Release](#package-release)
  - [Release by develop hash](#release-by-develop-hash)
  - [Override organisation registry](#override-organisation-registry)
  - [Create a private GHCR Token](#create-a-private-ghcr-token)
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

### Environment variables

Create a dotenv file containing the required environment variables for development.

```sh
touch .env
```

Open your favourite text editor to edit the file.

Here's an example for staging environent variable values:

```sh
PUBLIC_GRAPHQL_API_URL="https://graphql.service.fleek.xyz/graphql"
PUBLIC_DYNAMIC_ENVIRONMENT_ID="de23a5f0-aaa5-412e-8212-4fb056a3b30d"
PUBLIC_DASHBOARD_APP_URL="https://fleek.xyz/dashboard"
PUBLIC_UI_AGENTS_APP_URL="https://fleek.xyz/agents"
```

### Local Package Test

Since npm link is a command-line tool for symlinking a local package as a dependency during development. It is commonly used for testing packages before publishing them. But it's common to cause confusion and unexpected behaviour.

Instead of using `pnpm link` for local package testing, use the following command, that's closer to release install.

```sh
pnpm generate:local_package
```

Once successful, the console will display an install command that you can copy and run in your project.

Here's an example that uses npm:

```sh
npm i --no-save <GENERATED_FILE_PATH>
```

> [!WARNING]  
> Remove concurrent package name from package.json, e.g. @fleek-platform/agents-ui. The local install doesn't save or modify the package.json. The package.json and lockfiles are only for existing registry versions. You might have to run the clean command to remove any conflicting packages from node_modules, locks, etc.

Alternatively, if you're using an npm-compatible package manager like pnpm, avoid saving or modifying the lock file, e.g:

```sh
npm_config_save=false npm_config_lockfile=false pnpm i <GENERATED_FILE_PATH>
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

### Example

You can import the `LoginProvider` and `useAuthStore`. The provider allows you to customize the CTA buttons, e.g. log in.

```ts
import { LoginProvider, useAuthStore } from '@fleek-platform/login-button';
```

While the `useAuthStore` has actions and state, e.g. accessToken and setShowLogin.

```ts
// Use authentication store
const {
  // Toggle login modal
  setShowLogin,
  // Trigger logout
  setTriggerLogout,
  // Update accessToken by Project ID
  updateAccessTokenByProjectId,
  // Check if newUser
  isNewUser,
} = useAuthStore();
```

The `graphqlApiUrl` and `dynamicEnvironmentId` can be overriden. Otherwise, it'll default to the environment the distribution is built to target, e.g. staging or production.

```tsx
// Staging
const graphqlApiUrl = 'https://graphql.service.staging.fleeksandbox.xyz/graphql';
const dynamicEnvironmentId = 'c4d4ccad-9460-419c-9ca3-494488f8c892';
const onAuthenticationSuccess = () => console.log('onAuthenticationSuccess callback!');

// Use Login provider
<LoginProvider
  graphqlApiUrl={graphqlApiUrl}
  dynamicEnvironmentId={dynamicEnvironmentId}
  onAuthenticationSuccess={onAuthenticationSuccess}
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

## Package Release

TLDR; Use the [Release by develop hash](#release-by-develop-hash). The **main branch** must have a linear strategy, e.g. we don't want contributors to push directly to **main**. At anytime, it should be a subset of **develop**, as we are strictly about preventing source diversion. On production release, the package should be available at [npmjs.org](https://www.npmjs.com/~fleek-platform), for staging [GitHub Registry packages (GHCR)](https://github.com/orgs/fleek-platform/packages).

The main principal to understand is that when a branch is merged into **main** or **develop**, the npm-publisher.yml workflow is triggered to publish packages to the appropriate registry.

For the main branch, packages are published to the [npmjs.org](https://www.npmjs.com/~fleek-platform) registry, ensuring they are available for public use.

Conversely, when changes are merged into the develop branch, packages are published to the [GitHub Registry packages (GHCR)](https://github.com/orgs/fleek-platform/packages)
, which serves as a staging environment.

This setup allows for a clear separation between production-ready packages and those in development.

### Release by develop hash

You can release to production following a linear strategy. This assumes that the convention "main" branch is of linear history and is a subset of the "develop" branch commit history. For example, the team is happy to have "develop" as where the latest version of the project exists, that "main" shouldn't diverge and only contain commits from "develop".

Use-case examples:

- The team has merged some feature branches into develop identified as commit hash "abc123" and want to release upto to the commit history hash "abc123" onto "main". By doing this they expect the build process to occur and deploy into the Fleek Platform
- The team has merged several feature branches into develop identified as commit hashes `commitFeat1`, `commitFeat2` and `commitFeat3` by this historical order. It's decided to release everything in commit history until `commitFeat1`, but not `commitFeat2` and `commitFeat3`. Although, it'd be wiser to keep the feature branches in pending state as "develop" should always be in a ready state for testing and release as the team may want to release some quick hotfixes, etc

To release to production open the actions tab [here](https://github.com/fleek-platform/login-button/actions).

Select the "🚀 Release by develop hash" job in the left sidebar. Next, select the "Run workflow" drop-down and provide the required details, e.g. the commit hash of `develop branch` you are interested. Do note that it'll release everything up until the commit hash you select. If you have anything in develop which's not ready, that should be reverted from `develop branch`.

### Override organisation registry

You can override the organisation registry in different ways. For example, you can setup a local `.npmrc` that overrides the organisation `@fleek-platform` registry.

Start by changing to project directory and create or edit a .npmrc file:

```sh
touch .npmrc
```

Use your favourite text editor and put the following content:

```
//npm.pkg.github.com/:_authToken=$PAT
@fleek-platform:registry=https://npm.pkg.github.com
```

The `PAT` is an environment variable for your private authentication token. An authentication token is required for GHCR Registry, as GHCR is our private registry used for testing.

Alternatively, some users prefer to use the npm CLI to authenticate against the organisation scope.

Here's a quick set of instructions to allow to login via NPM CLI.

1) Execute the command npm login with scope and registry URL

```sh
npm login --scope=@fleek-platform --registry=https://npm.pkg.github.com
```

2) Provide a random username, e.g. somebody

```sh
username: somebody
```

3) Put the provided token as the user password

```sh
password: ***
```

Onwards, your registry for `@fleek-platform` will be pointing to private GitHub Registry. Make sure that you logout after testing, as this might cause confusion.

### Create a private GHCR Token

Visit your GitHub user [tokens](https://github.com/settings/tokens).

Create a new token that allows you to:
- Upload packages to GitHub Package Registry, e.g. `write:packages`
- Download packages from GitHub Package Registry, e.g. `read:packages`

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
