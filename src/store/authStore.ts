import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { decodeAccessToken } from '@fleek-platform/utils-token';
import { loginWithDynamic } from '../api/graphql-client';
import { useConfigStore } from './configStore';

type TriggerLoginModal = (open: boolean) => void;
type TriggerLogout = () => void;

export interface AuthStore {
  accessToken: string;
  authToken: string;
  isNewUser: boolean;
  projectId: string;
  loading: boolean;
  triggerLoginModal?: TriggerLoginModal;
  triggerLogout?: TriggerLogout;
  setAccessToken: (value: string) => void;
  setAuthToken: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setTriggerLogout: (triggerLogout: TriggerLogout) => void;
  setTriggerLoginModal: (callback: TriggerLoginModal) => void;
  updateAccessTokenByProjectId: (projectId: string) => Promise<void>;
  reset: () => void;
  setIsNewUser: (isNewUser: boolean) => void;
}

export interface AuthState
  extends Pick<AuthStore, 'accessToken' | 'authToken' | 'projectId' | 'loading' | 'isNewUser' | 'triggerLoginModal' | 'triggerLogout'> {}

export const initialState: AuthState = {
  accessToken: '',
  authToken: '',
  projectId: '',
  loading: false,
  isNewUser: false,
};

const name = 'fleek-xyz-login-button-store';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setAccessToken: (accessToken: string) => {
        // TODO: Ask user to get project id from host app
        // instead of providing here?
        // For the moment we provide this for free
        // everytime the token is computed to help
        const { projectId } = decodeAccessToken({
          token: accessToken,
        });

        if (!projectId) {
          throw Error(`Expected accessToken to include a project ID, but found ${typeof projectId}`);
        }

        set({
          accessToken,
          projectId,
        });
      },
      setAuthToken: (authToken: string) => set({ authToken }),
      setLoading: (loading: boolean) => set({ loading }),
      reset: () => set(initialState),
      updateAccessTokenByProjectId: async (projectId: string) => {
        try {
          set({ loading: true });

          const { authToken, accessToken: initAccessToken } = get();

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

          set({
            accessToken: res.data,
            projectId,
            loading: false,
          });
        } catch (err) {
          console.error('Failed to update access token:', err);

          set({
            loading: false,
            accessToken: '',
            projectId: '',
          });

          throw err;
        }
      },
      setIsNewUser: (isNewUser: boolean) => set({ isNewUser }),
      setTriggerLoginModal: (triggerLoginModal: TriggerLoginModal) => set({ triggerLoginModal }),
      setTriggerLogout: (triggerLogout: TriggerLogout) => set({ triggerLogout }),
    }),
    {
      name,
      storage: createJSONStorage(() => localStorage),
      // Persist only selected keys
      partialize: ({ accessToken, authToken, projectId }) => ({
        accessToken,
        authToken,
        projectId,
      }),
    },
  ),
);
