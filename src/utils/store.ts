type STORE_NAME = 'login-button' | 'config';

const CONFIG_NAMESPACE = 'fleek-xyz-login-btn';

export const getStoreName = (name: STORE_NAME) => `${CONFIG_NAMESPACE}-${name}-store`;
