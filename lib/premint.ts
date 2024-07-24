import { createCreatorClient } from '@zoralabs/protocol-sdk';
import { createPublicClient, http } from 'viem';
import { chain } from '@/constants/chain';

const createPremint = async (
  contract: any,
  token: any,
  contractAdmin: `0x${string}`,
  walletClient: any
) => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const chainId = chain.id;
  const creatorClient = createCreatorClient({ chainId, publicClient });

  const { collectionAddress, premintConfig, signAndSubmit } =
    await creatorClient.createPremint({
      contract,
      token,
    });

  const client = (await walletClient) as any;

  await signAndSubmit({
    account: contractAdmin,
    walletClient: client,
    checkSignature: true,
  });

  const uid = premintConfig?.uid;
  return {
    collectionAddress,
    uid,
  };
};

export default createPremint;
