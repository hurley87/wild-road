'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { chain } from '@/constants/chain';

function Privy({ children }: { children: React.ReactNode }) {
  const defaultChain = chain;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
        },
        defaultChain,
      }}
    >
      {children}
    </PrivyProvider>
  );
}

export default Privy;
