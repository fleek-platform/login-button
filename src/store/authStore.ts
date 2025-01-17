import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { decodeAccessToken } from '@fleek-platform/utils-token';
import { loginWithDynamic } from '../graphql/fetchLoginWithDynamic';
import { useConfigStore } from './configStore';

export interface AuthStore {
  accessToken: string;
  authToken: string;
  isNewUser: boolean;
  projectId: string;
  loading: boolean;
  showLogin: boolean;
  triggerLogout: boolean;
  setAccessToken: (value: string) => void;
  setAuthToken: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setShowLogin: (value: boolean) => void;
  setTriggerLogout: (value: boolean) => void;
  updateAccessTokenByProjectId: (projectId: string) => Promise<void>;
  reset: () => void;
  setIsNewUser: (isNewUser: boolean) => void;
}

export interface AuthState extends Pick<AuthStore, 'accessToken'| 'authToken' | 'projectId' | 'loading' | 'showLogin' | 'triggerLogout' | 'isNewUser'> {}

export const initialState: AuthState = {
  accessToken: '',
  authToken: '',
  projectId: '',
  showLogin: false,
  triggerLogout: false,
  loading: false,
  isNewUser: false,
};

const name = 'fleek-xyz-login-button-store';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setShowLogin: (showLogin: boolean) => set({ showLogin }),
      setTriggerLogout: (triggerLogout: boolean) => set({ triggerLogout }),
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
          
          console.log(`[debug] authStore: initAccessToken = ${initAccessToken}`)
          
          if (!authToken) {
            throw new Error('Auth token is required to update access token');
          }

          if (!graphqlApiUrl) {
            throw new Error('GraphQL API URL is required to update access token');
          }

          const accessToken = await loginWithDynamic(graphqlApiUrl, authToken, projectId);

          console.log(`[debug] authStore: afterAccessToken = ${accessToken}`)

          if (!accessToken) {
            throw new Error('Failed to get access token');
          }

          set({
            accessToken,
            projectId,
            loading: false
          });
        } catch (err) {
          console.error('Failed to update access token:', err);

          set({
            loading: false,
            accessToken: '',
            projectId: ''
          });

          throw err;
        }
      },
      setIsNewUser: (isNewUser: boolean) => set({ isNewUser }),
    }),
    {
      name,
      storage: createJSONStorage(() => localStorage),
      // Persist only selected keys
      partialize: ({ accessToken, authToken, projectId }) => ({
        accessToken,
        authToken,
        projectId,
      })
    },
  ),
);
