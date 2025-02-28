type STORE_NAME = 'login-button' | 'config';

const CONFIG_NAMESPACE = 'fleek-xyz-login-btn';

export const getStoreName = (name: STORE_NAME) => `${CONFIG_NAMESPACE}-${name}-store`;

export const hasLocalStorageItems = (term: string) => {
  try {
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available in this environment');
      return false;
    }
    
    return Object.keys(localStorage).some(key => key.startsWith(term));
  } catch (error) {
    console.error('Failed to compute localStorage', error);
    return false;
  }
};
