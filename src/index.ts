import { isClient } from './utils/browser';

if (!isClient) {
  import('dotenv/config');
}

export { LoginProvider } from './providers/LoginProvider';
export { useAuthStore } from './store/authStore';
export { cookies } from './utils/cookies';

export type { AuthStore } from './store/authStore';
export type { ConfigStore } from './store/configStore';
