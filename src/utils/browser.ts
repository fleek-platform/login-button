export const isClient = typeof window !== 'undefined';

export const clearStorageByMatchTerm = (term: string) => {
  try {
    Object.keys(localStorage).forEach(key => {
      try {
        if (key.toLowerCase().includes(term)) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn(`Failed to clear localStorage key ${key}:`, e);
      }
    });

    Object.keys(sessionStorage).forEach(key => {
      try {
        if (key.toLowerCase().includes(term)) {
          sessionStorage.removeItem(key);
        }
      } catch (e) {
        console.warn(`Failed to clear sessionStorage key ${key}:`, e);
      }
    });
  } catch (error) {
    console.error('Failed to clear storage due to an error', error);
  }
}
