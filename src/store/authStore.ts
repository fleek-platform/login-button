import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { decodeAccessToken } from '@fleek-platform/utils-token';

export interface AuthStore {
  accessToken: string;
  authToken: string;
  projectId: string;
  loading: boolean;
  setAccessToken: (value: string) => void;
  setAuthToken: (value: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface AuthState extends Pick<AuthStore, 'accessToken'| 'authToken' | 'projectId' | 'loading'> {}

export const initialState: AuthState = {
  accessToken: '',
  authToken: '',
  projectId: '',
  loading: false,
};

const name = 'fleek-xyz-login-button-store';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
