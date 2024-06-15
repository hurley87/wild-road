'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Base, BaseGoerli } from '@thirdweb-dev/chains';
import { chain } from '@/constants/chain';

function Privy({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultChain = chain;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider
          activeChain={isProduction ? Base : BaseGoerli}
          clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        >
          {children}
        </ThirdwebProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default Privy;
