import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';

import { useCookies } from '@/providers/CookiesProvider';
import { getDefined } from '@/utils/defined';

export type DynamicProviderProps = React.PropsWithChildren<{}>;

const environmentId = getDefined('LB__DYNAMIC_ENVIRONMENT_ID');

export const DynamicProvider: React.FC<DynamicProviderProps> = ({ children }) => {
  const cookies = useCookies();

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        // @ts-ignore
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: {
          onLogout: () => {
            cookies.remove('authProviderToken');
            cookies.remove('accessToken');
          },
          onAuthSuccess: (args) => {
            console.log('onAuthSuccess was called', args);

            const authToken = getAuthToken();
            console.log('authToken', authToken);

            // call mutation
          },
        },
      }}
    >
      <>{children}</>
    </DynamicContextProvider>
  );
};
