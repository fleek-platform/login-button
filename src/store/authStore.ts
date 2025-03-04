import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginWithDynamic } from '../api/graphql-client';
import { useConfigStore } from './configStore';
import { getStoreName } from '../utils/store';
import { decodeAccessToken } from '../utils/token';
import type { UserProfile } from '@dynamic-labs/sdk-react-core';
import { cookies } from '../utils/cookies';

export type TriggerLoginModal = (open: boolean) => void;
export type TriggerLogout = () => void;
export type ReinitializeSdk = () => void;

const name = getStoreName('login-button');

export interface AuthStore {
  accessToken: string;
  authToken: string;
  authenticating: boolean;
  isNewUser: boolean;
  projectId: string;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  userProfile?: UserProfile;
  triggerLoginModal?: TriggerLoginModal;
  triggerLogout?: TriggerLogout;
  reinitializeSdk?: ReinitializeSdk;
  setAccessToken: (value: string) => void;
  setAuthToken: (value: string) => void;
  setIsLoggingIn: (isLoggingIn: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setTriggerLogout: (triggerLogout: TriggerLogout) => void;
  setTriggerLoginModal: (callback: TriggerLoginModal) => void;
  setReinitializeSdk: (callback: ReinitializeSdk) => void;
  updateAccessTokenByProjectId: (projectId: string) => Promise<void>;
  reset: () => void;
  setIsNewUser: (isNewUser: boolean) => void;
  setUserProfile: (userProfile: UserProfile) => void;
  setProjectId: (projectId: string) => void;
  setAuthenticating: (authenticating: boolean) => void;
}

export interface AuthState
  extends Pick<
    AuthStore,
    | 'accessToken'
    | 'authenticating'
    | 'authToken'
    | 'projectId'
    | 'isNewUser'
    | 'triggerLoginModal'
    | 'triggerLogout'
    | 'isLoggedIn'
    | 'isLoggingIn'
    | 'userProfile'
  > {}

export const initialState: AuthState = {
  accessToken: '',
  authenticating: false,
  authToken: '',
  projectId: '',
  isNewUser: false,
  isLoggedIn: false,
  isLoggingIn: false,
  userProfile: undefined,
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...initialState,
  setAccessToken: (accessToken: string) => {
    const projectId = decodeAccessToken(accessToken);

    set({
      accessToken,
      projectId,
    });

    cookies.set('accessToken', accessToken);
    cookies.set('projectId', projectId);
  },
  setAuthToken: (authToken: string) => {
    set({ authToken });

    cookies.set('authToken', authToken);
  },
  setIsLoggingIn: (isLoggingIn: boolean) => set({ isLoggingIn }),
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  reset: () => set(initialState),
  updateAccessTokenByProjectId: async (projectId: string) => {
    try {
      set({ isLoggingIn: true });

      const { authToken } = get();

      const { graphqlApiUrl } = useConfigStore.getState();

      if (!authToken) {
        throw new Error('Auth token is required to update access token');
      }

      if (!graphqlApiUrl) {
        throw new Error('GraphQL API URL is required to update access token');
      }

      const res = await loginWithDynamic(graphqlApiUrl, authToken, projectId);

      if (!res.success) {
        throw new Error(res.error.message);
      }

      if (!res.data) {
        throw new Error('Failed to get access token');
      }

      const accessToken = res.data;

      const decodedProjectId = decodeAccessToken(accessToken);

      if (!decodedProjectId) throw Error(`Expected a Project identifier but got ${projectId || typeof projectId}`);

      if (decodedProjectId !== projectId) throw Error('Found a project mismatch');

      set({
        accessToken,
        projectId,
        isLoggingIn: false,
      });

      cookies.set('accessToken', accessToken);
    } catch (err) {
      console.error('Failed to update access token:', err);

      set({
        isLoggingIn: false,
        accessToken: '',
        projectId: '',
      });

      throw err;
    }
  },
  setUserProfile: (userProfile: UserProfile) => set({ userProfile }),
  setIsNewUser: (isNewUser: boolean) => set({ isNewUser }),
  setTriggerLoginModal: (triggerLoginModal: TriggerLoginModal) => set({ triggerLoginModal }),
  setTriggerLogout: (triggerLogout: TriggerLogout) => set({ triggerLogout }),
  setProjectId: (projectId: string) => set({ projectId }),
  setReinitializeSdk: (reinitializeSdk: ReinitializeSdk) => set({ reinitializeSdk }),
  setAuthenticating: (authenticating: boolean) => set({ authenticating }),
}));
