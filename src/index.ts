import { isClient } from './utils/browser';

if (!isClient) {
  import('dotenv/config');
}

export { LoginProvider } from './providers/LoginProvider';
export { useAuthStore } from './store/authStore';
export { cookies } from './utils/cookies';

export type { AuthStore } from './store/authStore';
export type { ConfigStore } from './store/configStore';
export { AuthButton } from './components/AuthButton';

export { ProductDropdown, type Product } from './ui/ProductDropdown';

export { setDefined } from './defined';
