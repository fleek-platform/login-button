import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthStore {
  accessToken: {
    value: string;
    isLoading: boolean;
    error: unknown;
  };
  setAccessTokenValue: (value: string) => void;
  setAccessTokenLoading: (isLoading: boolean) => void;
  setAccessTokenError: (error: unknown) => void;
  resetAccessToken: () => void;
}

export const initialAccessTokenState: AuthStore['accessToken'] = {
  value: '',
  error: undefined,
  isLoading: false,
};

// Store name
const name = 'fleek-xyz-login-button-store';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: { ...initialAccessTokenState },
      setAccessTokenValue: (value: string) => set((state) => ({ accessToken: { ...state.accessToken, value } })),
      setAccessTokenLoading: (isLoading: boolean) => set((state) => ({ accessToken: { ...state.accessToken, isLoading } })),
      setAccessTokenError: (error: unknown) => set((state) => ({ accessToken: { ...state.accessToken, error } })),
      resetAccessToken: () => set({ accessToken: { ...initialAccessTokenState } }),
    }),
    {
      name,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
