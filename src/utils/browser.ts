export const isClient = typeof window !== 'undefined';

const userSessionLocalStorageKeys = ['dynamic', 'wagmi', 'fleek-xyz'];

export const clearStorageByMatchTerm = (term: string) => {
  try {
    for (const key in localStorage) {
      try {
        if (key.toLowerCase().startsWith(term)) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn(`Failed to clear localStorage key ${key}:`, e);
      }
    }

    for (const key in sessionStorage) {
      try {
        if (key.toLowerCase().startsWith(term)) {
          sessionStorage.removeItem(key);
        }
      } catch (e) {
        console.warn(`Failed to clear sessionStorage key ${key}:`, e);
      }
    }
  } catch (error) {
    console.error('Failed to clear storage due to an error', error);
  }
};

export const clearUserSessionKeys = () => {
  for (const item of userSessionLocalStorageKeys) {
    clearStorageByMatchTerm(item);
  }
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0;
};
