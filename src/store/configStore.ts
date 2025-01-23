import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getDefined } from '../defined';
import { getStoreName } from '../utils/store';

interface Config {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
}

const name = getStoreName('config');

// TODO: Can get default from env var through getDefined
// but these should only be set if the user doesn't provide it
// as a fallback. Otherwise, the initial call will use
// the settings and cause CORS. To prevent it, we only pass
// fallback values, if host app does not provide it.
// Which settings will be prod.
// Setter is in src/providers/LoginProvider.tsx
const defaultConfig: Config = {
  graphqlApiUrl: '',
  dynamicEnvironmentId: '',
};

export interface ConfigStore {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
  setConfig: (newConfig: Partial<Config>) => void;
  getConfigValue: (key: keyof Config) => string;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      ...defaultConfig,
      setConfig: (newConfig: Partial<Config>) => {
        set((state) => ({ ...state, ...newConfig }));
      },
      getConfigValue: (key: keyof Config) => {
        if (!(key in defaultConfig)) {
          throw new Error(`Configuration key "${key}" does not exist`);
        }
        return defaultConfig[key];
      },
    }),
    {
      name,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
