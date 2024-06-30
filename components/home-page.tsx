'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from './ui/button';
import { createCollectorClient } from '@zoralabs/protocol-sdk';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { chain } from '@/constants/chain';
import { useWallet } from '@thirdweb-dev/react';

export default function HomePage() {
  const { login, user } = usePrivy();
  const account = user?.wallet?.address as `0x${string}`;
  console.log('account', account);
  const { wallets } = useWallets();
  console.log('wallets', wallets);
  const wallet = wallets.find((wallet) => wallet.address === account);
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const handleMint = async () => {
    console.log('Minting');
    const chainId = chain.id;
    console.log('chainId', chainId);
    const creatorClient = createCollectorClient({ chainId, publicClient });
    const minterAccount = user?.wallet?.address as `0x${string}`;

    const { parameters } = await creatorClient.mint({
      tokenContract: '0x62D94e39eF0Cd36A266456b919Ef3f4F23598110',
      mintType: 'premint',
      uid: 4,
      quantityToMint: 1,
      mintComment: '1111 $enjoy',
      minterAccount,
    });

    console.log('cool', parameters);
    const ethereumProvider = (await wallet?.getEthereumProvider()) as any;

    const walletClient = await createWalletClient({
      account,
      chain,
      transport: custom(ethereumProvider),
    });

    const { request }: any = await publicClient.simulateContract(parameters);

    const hash = await walletClient.writeContract(request);
    console.log('Transaction hash: ', hash);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    console.log('Transaction receipt: ', receipt);
  };

  return (
    <main className="flex flex-col items-center justify-between p-24">
      {user ? (
        <Button onClick={handleMint}>Mint</Button>
      ) : (
        <Button onClick={login}>Login</Button>
      )}
    </main>
  );
}
