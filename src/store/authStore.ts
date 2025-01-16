import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthStore {
  accessToken: string;
  loading: boolean;
  error: unknown;
  setAccessToken: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: unknown) => void;
  resetAuthState: () => void;
}

export interface AuthState extends Pick<AuthStore, 'accessToken' | 'loading' | 'error'> {}

export const initialAuthState: AuthState = {
  accessToken: '',
  loading: false,
  error: undefined,
};

// Store name
const name = 'fleek-xyz-login-button-store';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialAuthState,
      setAccessToken: (accessToken: string) => set({ accessToken }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: unknown) => set({ error }),
      resetAuthState: () => set({ ...initialAuthState }),
    }),
    {
      name,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
