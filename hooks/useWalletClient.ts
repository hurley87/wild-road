import { type WalletClient, createWalletClient, custom } from 'viem';
import { chain } from '@/constants/chain';

type WalletClientType = {
  wallet: any;
};

const useWalletClient = async ({ wallet }: WalletClientType) => {
  if (!wallet) return null;
  // Switch your wallet to your target chain before getting the viem WalletClient
  await wallet?.switchChain(chain.id);
  // Get an EIP1193 provider from the user's wallet
  const ethereumProvider = await wallet?.getEthereumProvider();
  // get address from wallet
  const account = wallet?.address as `0x${string}`;
  // Create a Viem wallet client from the EIP1193 provider
  const walletClient = await createWalletClient({
    account,
    chain,
    transport: custom(ethereumProvider),
  });

  return walletClient as WalletClient;
};

export default useWalletClient;
