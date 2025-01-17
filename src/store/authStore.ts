import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthStore {
  accessToken: string;
  loading: boolean;
  setAccessToken: (value: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface AuthState extends Pick<AuthStore, 'accessToken' | 'loading'> {}

export const initialState: AuthState = {
  accessToken: '',
  loading: false,
};

const name = 'fleek-xyz-login-button-store';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAccessToken: (accessToken: string) => set({ accessToken }),
      setLoading: (loading: boolean) => set({ loading }),
      reset: () => set(initialState),
    }),
    {
      name,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
