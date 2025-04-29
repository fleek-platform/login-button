'use client';

import { type FC, useCallback, useState, useEffect } from 'react';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import {
  DynamicContextProvider,
  useDynamicContext,
  type UserProfile as DynamicUserProfile,
  useReinitialize,
  getAuthToken,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import { generateUserSessionDetails, me, project } from '../api/graphql-client';
import { type TriggerLoginModal, type TriggerLogout, useAuthStore, type ReinitializeSdk, type UserProfile } from '../store/authStore';
import { cookies } from '../utils/cookies';
import type { LoginProviderChildrenProps } from './LoginProvider';
import { decodeAccessToken, truncateMiddle, isTokenExpired } from '../utils/token';
import { clearUserSessionKeys, isTouchDevice } from '../utils/browser';
import { hasLocalStorageItems } from '../utils/store';
import { useDebouncedCallback } from 'use-debounce';
import cssOverrides from '../styles/dynamicOverrides.css';

type HasDataCommonError = {
  error: {
    type: string;
  };
};

type DynamicUtilsProps = {
  onTriggerLoginModal?: (callback: TriggerLoginModal) => void;
  onTriggerLogout?: (triggerLogout: TriggerLogout) => void;
  graphqlApiUrl: string;
  accessToken: string;
  authenticating: boolean;
  onLogout: () => void;
  setReinitializeSdk: (callback: ReinitializeSdk) => void;
};

const DynamicUtils = ({
  onTriggerLoginModal,
  onTriggerLogout,
  graphqlApiUrl,
  accessToken,
  authenticating,
  onLogout,
  setReinitializeSdk,
}: DynamicUtilsProps) => {
  const { updateAccessTokenByProjectId } = useAuthStore();

  const { sdkHasLoaded, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const reinitializeSdk = useReinitialize();
  const localStorageAuthToken = getAuthToken();

  const validateUserSessionDebonced = useDebouncedCallback(() => {
    // Validates the user session sometime in the future.
    // If found faulty, it should clear the user session
    // e.g. user session clear/logout by dashboard.
    // On the other hand, an existing user session can
    // persist (localStorage), but dashboard uses cookies
    // e.g. user logins in website and expect cross session.
    // This is more of a safe-guard due to Dashboard
    // having the requirement to clear localStorage items
    // that match prefix `fleek-xyz-login`, meaning
    // we're only computing if that fails to happen
    validateUserSession({
      accessToken,
      authenticating,
      localStorageAuthToken,
      graphqlApiUrl,
      reinitializeSdk,
      onAuthenticationFailure: () => onLogout(),
    });
  }, 400);

  // biome-ignore lint/correctness/useExhaustiveDependencies(setShowAuthFlow): causes infinite render, probably not memoized
  useEffect(() => {
    if (!sdkHasLoaded || !onTriggerLoginModal) return;
    onTriggerLoginModal(setShowAuthFlow);
  }, [onTriggerLoginModal, sdkHasLoaded]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(handleLogOut): causes infinite render, probably not memoized
  useEffect(() => {
    if (!sdkHasLoaded || !onTriggerLogout) return;
    onTriggerLogout(handleLogOut);
  }, [onTriggerLogout, sdkHasLoaded]);

  useEffect(() => {
    if (!reinitializeSdk) return;

    setReinitializeSdk(reinitializeSdk);
  }, [setReinitializeSdk, reinitializeSdk]);

  useEffect(() => {
    // TODO: Is visibilitychange supported on all major browsers? Test against `focus`
    document.addEventListener('visibilitychange', validateUserSessionDebonced);

    return () => {
      document.removeEventListener('visibilitychange', validateUserSessionDebonced);
    };
  }, [validateUserSessionDebonced]);

  useEffect(() => {
    if (!accessToken) return;

    const check = async () => {
      const { exp, projectId } = decodeAccessToken(accessToken);
      // TODO: The expiration Offset is used for debugging
      // can be removed in the future
      const expirationOffset = cookies.get('expirationOffset');
      const computedExpiration = expirationOffset ? exp - Number(expirationOffset) : exp;

      const hasExpiredToken = isTokenExpired(computedExpiration);

      if (hasExpiredToken) {
        updateAccessTokenByProjectId(projectId);

        return;
      }

      const hasMeResult = await me(graphqlApiUrl, accessToken);
      const hasMe = !!hasMeResult.success;
      const hasNetworkError = !hasMeResult.success && (hasMeResult as HasDataCommonError)?.error?.type === 'NETWORK_ERROR';

      if (hasNetworkError) return false;

      if (hasExpiredToken || !hasMe) {
        onLogout();

        return;
      }
    };

    check();
  }, [accessToken]);

  return null;
};

export type DynamicProviderProps = {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
  onAuthenticationSuccess?: () => void;
  children: (props: LoginProviderChildrenProps) => React.JSX.Element;
};

const validateUserSession = async ({
  accessToken,
  authenticating,
  localStorageAuthToken,
  graphqlApiUrl,
  onAuthenticationFailure,
  onAuthenticationSuccess,
}: {
  accessToken: string;
  authenticating: boolean;
  localStorageAuthToken?: string;
  graphqlApiUrl: string;
  onAuthenticationFailure: () => void;
  onAuthenticationSuccess?: () => void;
  reinitializeSdk?: () => void;
}): Promise<boolean> => {
  try {
    const cookieAuthToken = cookies.get('authToken');
    const cookieAccessToken = cookies.get('accessToken');

    const hasAuthenticationInProgress = authenticating;

    const hasMatchingTokens = !authenticating && cookieAuthToken === localStorageAuthToken && cookieAccessToken === accessToken;

    const hasDynamicLocalStorageItems = !!hasLocalStorageItems('dynamic') && !!localStorageAuthToken;

    const hasDynamicAuthWithoutAccessTokens = !!hasDynamicLocalStorageItems && (!cookieAuthToken || !cookieAccessToken);

    const hasDynamicAuthWithAccessTokens = !!hasDynamicLocalStorageItems && !!accessToken && !!cookieAuthToken && !!cookieAccessToken;

    const hasMatchingAcessTokenInCookie = !!accessToken && accessToken === cookieAccessToken;

    if (hasAuthenticationInProgress) return false;

    if (hasMatchingTokens) {
      const hasMeResult = await me(graphqlApiUrl, cookieAccessToken);
      const hasMe = !!hasMeResult.success;

      if (!hasMe) throw Error('Invalid user access token result!');

      return true;
    }

    if (hasDynamicAuthWithoutAccessTokens) throw Error('Authentication found incomplete token pair in cookie data');

    if (!hasDynamicAuthWithAccessTokens || !cookieAccessToken) return false;

    if (!hasMatchingAcessTokenInCookie) {
      console.error(
        `Expected ${truncateMiddle(accessToken)} but got ${typeof cookieAccessToken === 'string' ? truncateMiddle(cookieAccessToken) : typeof cookieAccessToken}. The browser tab should reload!`,
      );

      // TODO: When a user switches project in a tab
      // other open tabs detect a mismatch with the in-memory
      // versus the cookie project ID and consider it faulty
      // Instead of dismissing the user session (current
      // behavior), it'll reload as a temporary solution
      // until we can properly control the project switcher
      // with the user's latest preference.
      window.location.reload();

      return false;
    }

    const { projectId } = decodeAccessToken(cookieAccessToken);

    if (!projectId) throw Error(`Expected a Project identifier but got ${projectId || typeof projectId}`);

    const [hasMeResult, hasProjectResult] = await Promise.all([
      me(graphqlApiUrl, cookieAccessToken),
      project(graphqlApiUrl, cookieAccessToken, projectId),
    ]);

    // Important to prevent false status checkups
    // e.g. it might cause to call `onAuthenticationFailure`
    // which would clear the user session details wrongly
    const hasNetworkError =
      (!hasMeResult.success && (hasMeResult as HasDataCommonError)?.error?.type === 'NETWORK_ERROR') ||
      (!hasProjectResult.success && (hasProjectResult as HasDataCommonError)?.error?.type === 'NETWORK_ERROR');

    if (hasNetworkError) return false;

    const hasMe = !!hasMeResult.success;
    const hasProject = !!hasProjectResult.success;

    const hasUserSessionExpectedDetails = hasMe && hasProject;

    if (!hasUserSessionExpectedDetails) throw Error('Unexpected user session details');

    typeof onAuthenticationSuccess === 'function' && onAuthenticationSuccess();

    return true;
  } catch (error) {
    console.error('Authentication validation failed', error);

    onAuthenticationFailure();

    return false;
  }
};

export const DynamicProvider: FC<DynamicProviderProps> = ({ children, graphqlApiUrl, dynamicEnvironmentId, onAuthenticationSuccess }) => {
  const {
    accessToken,
    authenticating,
    setAccessToken,
    setAuthToken,
    reset: resetStore,
    setUserProfile,
    setIsNewUser,
    triggerLoginModal,
    setTriggerLoginModal,
    setTriggerLogout,
    triggerLogout,
    setIsLoggedIn,
    setReinitializeSdk,
    reinitializeSdk,
    setAuthenticating,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const onLogout = () => {
    cookies.reset();
    // TODO: Make sure the reset is not clearing
    // the trigger callbacks
    // TODO: Do we need store actions? Havint it
    // in the store as `actions` is ok, but maybe
    // have them set as mutable module variables
    // to reduce configuration or setup needs
    // which is quite verbose at the moment
    resetStore();
    // TODO: Dashboard has a concurrent process
    // that should also match these requirements
    // Clear critical stores
    clearUserSessionKeys();
    setIsLoggedIn(false);

    typeof reinitializeSdk === 'function' && reinitializeSdk();

    // TODO: The following can be dismiss since
    // introducing reinitializeSdk. But, a logout
    // processing state is required.
    // For the moment, we'll flush the session
    // by refreshing the page.
    window.location.reload();
  };

  const onAuthInit = () => setAuthenticating(true);

  // The following to mitigate an issue reported in ticket
  // https://linear.app/fleekxyz/issue/PLAT-2777
  // e.g. on wallet signup can't type email.
  // The following is a temporary solution
  // that relies on <DynamicWidget /> due to triggering
  // via provided hook causes the issue on mobile.
  const customLogin = () => {
    const el = document.querySelector('#dynamic-widget button.connect-button') as HTMLElement;

    if (el && isTouchDevice()) {
      el.click();

      return;
    }

    typeof triggerLoginModal === 'function' && triggerLoginModal(true);
  };

  // TODO: Remove useCallback to inspect re-triggers
  const onAuthSuccess = useCallback(
    async ({ user }: { user: DynamicUserProfile }) => {
      try {
        const authToken = getAuthToken();

        if (!graphqlApiUrl) throw Error(`Expected Graphql API Url but got ${typeof graphqlApiUrl} `);

        if (!authToken) throw Error(`Expected an authToken but got ${typeof authToken}`);

        setIsLoading(true);
        setAuthToken(authToken);
        setError(undefined);
        setIsNewUser(!!user?.newUser);

        const result = await generateUserSessionDetails(graphqlApiUrl, authToken);

        if (!result.success) throw Error(result.error.message);

        if (!result.data.accessToken) throw Error(`Expected a valid access token but got ${typeof result.data.accessToken}`);

        const userProfile: UserProfile = { ...user, avatar: result.data?.user.avatar, username: result.data?.user.username };
        setUserProfile(userProfile);
        setAccessToken(result.data.accessToken);
        setIsLoggedIn(true);
        setAuthenticating(false);

        typeof onAuthenticationSuccess === 'function' && onAuthenticationSuccess();
      } catch (err) {
        console.error(err);
        // TODO: Is this really required?
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [graphqlApiUrl, setAuthToken, setAccessToken, setIsLoggedIn, setUserProfile, setIsNewUser, onAuthenticationSuccess, setAuthenticating],
  );

  // Support cross application user session
  // by applying authentication user details
  // from user cookies based on app hostname
  // e.g. *fleek.xyz
  useEffect(() => {
    const authToken = cookies.get('authToken');
    const accessToken = cookies.get('accessToken');

    if (!authToken) {
      return;
    }

    if (!accessToken) {
      return;
    }

    try {
      decodeAccessToken(accessToken);
      setAuthToken(authToken);
      setAccessToken(accessToken);
      setIsLoggedIn(true);
    } catch (_err) {
      console.warn('A user access token was found to be invalid!');
    }
  }, [setAuthToken, setAccessToken, setIsLoggedIn]);

  const settings = {
    environmentId: dynamicEnvironmentId,
    walletConnectors: [EthereumWalletConnectors],
    events: {
      onLogout,
      onAuthSuccess,
      onAuthInit,
    },
    // TODO: Use the correct override
    // using scale might not be appropriate
    // https://docs.dynamic.xyz/design-customizations/css/css-variables#css-variables
    shadowDOMEnabled: false,
    cssOverrides,
  };

  return (
    <DynamicContextProvider settings={settings}>
      <DynamicUtils
        accessToken={accessToken}
        authenticating={authenticating}
        graphqlApiUrl={graphqlApiUrl}
        onTriggerLoginModal={setTriggerLoginModal}
        onTriggerLogout={setTriggerLogout}
        onLogout={onLogout}
        setReinitializeSdk={setReinitializeSdk}
      />
      {/* Warning: The following is a quick solution for https://linear.app/fleekxyz/issue/PLAT-2777; It's not a long term solution; See customLogin() patched implementation */}
      <div className="hidden">
        <DynamicWidget variant="modal" />
      </div>
      {children({
        accessToken,
        isLoading,
        error,
        login: () => customLogin(),
        logout: () => typeof triggerLogout === 'function' && triggerLogout(),
      })}
    </DynamicContextProvider>
  );
};
