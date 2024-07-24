import { usePrivy, useWallets } from '@privy-io/react-auth';
import useWalletClient from '@/hooks/useWalletClient';

export const useContractAdmin = () => {
  const { user } = usePrivy();
  const contractAdmin = user?.wallet?.address as `0x${string}`;
  const { wallets } = useWallets();
  const wallet = wallets.find((wallet) => wallet.address === contractAdmin);
  const walletClient = useWalletClient({ wallet });

  return { contractAdmin, walletClient };
};
