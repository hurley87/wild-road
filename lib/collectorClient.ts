import { createPublicClient, http } from 'viem';
import { createCollectorClient } from '@zoralabs/protocol-sdk';
import { chain } from '@/constants/chain';

export const getCollectorClient = () => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const chainId = chain.id;
  const creatorClient = createCollectorClient({ chainId, publicClient });

  return creatorClient;
};
