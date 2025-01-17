import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getDefined } from '../defined';

interface Config {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
}

const defaultConfig: Config = {
  graphqlApiUrl: getDefined('PUBLIC_GRAPHQL_ENDPOINT'),
  dynamicEnvironmentId: getDefined('PUBLIC_DYNAMIC_ENVIRONMENT_ID'),
};

export interface StoreInterface {
  graphqlApiUrl: string;
  dynamicEnvironmentId: string;
  setConfig: (newConfig: Partial<Config>) => void;
  getConfigValue: (key: keyof Config) => string;
}

export const useConfigStore = create<StoreInterface>()(
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
      name: 'config-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
