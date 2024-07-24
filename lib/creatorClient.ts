import { createPublicClient, http } from 'viem';
import { createCreatorClient } from '@zoralabs/protocol-sdk';
import { chain } from '@/constants/chain';

export const getCreatorClient = () => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const chainId = chain.id;
  const creatorClient = createCreatorClient({ chainId, publicClient });

  return creatorClient;
};
