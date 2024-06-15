'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, type WalletClient } from 'viem';
import { createCreatorClient } from '@zoralabs/protocol-sdk';
import { useRef, useState } from 'react';
import { useStorageUpload } from '@thirdweb-dev/react';
import useWalletClient from '@/hooks/useWalletClient';
import { useRouter } from 'next/navigation';
// import { createToken } from '@/lib/api';
import { chain } from '@/constants/chain';
import { formatImage } from '@/lib/formatting';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function CreatePost() {
  const { login, user } = usePrivy();
  const contractAdmin = user?.wallet?.address as `0x${string}`;
  const inputFile = useRef<HTMLInputElement>(null);
  const { mutateAsync: upload } = useStorageUpload();
  const [uploading, setUploading] = useState(false);
  const [imageURI, setImageURI] = useState('');
  const [file, setFile] = useState<any>();
  const { wallets } = useWallets();
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const [contractName, setContractNmae] = useState('');
  const [description, setDescription] = useState('');
  const wallet = wallets[0];
  const router = useRouter();
  const walletClient = useWalletClient({ chain, wallet });
  const [imageSaved, setImageSaved] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const create = useMutation(api.collections.create);

  async function createContract({
    contractName,
    walletClient,
  }: {
    contractName: string;
    walletClient: WalletClient;
  }) {
    setUploading(true);

    if (!contractName) {
      //   toast.error('Please enter a name');
      setUploading(false);
      return;
    }

    if (!description) {
      //   toast.error('Please enter a description');
      setUploading(false);
      return;
    }

    if (!walletClient) {
      //   toast.error('Please connect your wallet');
      setUploading(false);
      return;
    }

    // upload metadata to ipfs
    const data = [
      {
        name: contractName,
        description,
        image: imageURI,
        content: {
          mime: file.type,
          uri: imageURI,
        },
      },
    ];
    const uris = await upload({ data });
    const uri = uris[0];

    console.log('uri', uri);

    // create contract
    const chainId = chain.id;
    const creatorClient = createCreatorClient({ chainId, publicClient });

    const tokenData = {
      // collection info of collection to create.  The combination of these fields will determine the
      // deterministic collection address.
      contract: {
        // the account that will be the admin of the collection.  Must match the signer of the premint.
        contractAdmin,
        contractName,
        contractURI: uri,
      },
      // token info of token to create
      token: {
        tokenURI: uri,
        // address to get create referral reward
        createReferral: '0x1D266998DA65E25DE8e1770d48e0E55DDEE39D24',
        // the earliest time the premint can be brought onchain.  0 for immediate.
        mintStart: BigInt(0),
        // the duration of the mint.  0 for infinite.
        mintDuration: BigInt(0),
        // address to receive creator rewards for free mints, or if its a paid mint, the paid mint sale proceeds.
        payoutRecipient: contractAdmin,
        // collection: '0x158d20e905e3c4dd465dd0020df604ae9eb40340',
      },
    };

    try {
      const {
        // the premint that was created
        premintConfig,
        // collection address of the premint
        collectionAddress,
        // used to sign and submit the premint to the Zora Premint API
        signAndSubmit,
      } = await creatorClient.createPremint(tokenData);
      await signAndSubmit({
        // account to sign the premint
        account: contractAdmin,
        // the walletClient will be used to sign the message.
        walletClient,
        // if true, the signature will be checked before being submitted.
        // this includes validating that the signer is authorized to create the premint.
        checkSignature: true,
      });

      const uid = premintConfig.uid;
      const collection = collectionAddress;

      console.log('uid', uid);
      console.log('collection', collection);

      const res = await create({
        uid,
        collection,
        contractAdmin,
        uri,
        contractName,
        description,
      });

      console.log('res', res);
    } catch {
      setUploading(false);
    }

    // const hash = await client.writeContract(simulateRequest as any);

    // //
    // const receipt = await publicClient.waitForTransactionReceipt({ hash });
    // const contractAddress = receipt.logs[0].address;

    // save token to database
    // const token = {
    //   id: contractAddress,
    //   name,
    //   description,
    //   image: imageURI,
    //   hash: receipt.transactionHash,
    //   userAddress: account,
    //   email,
    // };

    // await createToken({ token });
    // // redirect to the share token page
    // router.push(`/share/${contractAddress}`);
  }

  async function handleCreateContract() {
    const client = await walletClient;
    createContract({ contractName, walletClient: client });
  }

  const handleChange = async (e: any) => {
    setImageSaved(false);
    const file = e.target.files[0];
    // upload image to ipfs
    setFile(file);
    const img_uris = await upload({ data: [file] });
    setImageURI(img_uris[0]);
    setImageSaved(true);
  };

  return (
    <div className="py-6">
      <div className="flex flex-col items-center justify-center rounded-lg bg-light px-2 text-center w-full">
        <button
          disabled={uploading}
          onClick={() => inputFile.current && inputFile?.current?.click()}
          style={{
            backgroundImage: `url(${formatImage(imageURI)})`,
            backgroundSize: 'cover',
          }}
          className="bg-button p-3 rounded-2xl w-full h-[400px] hover:bg-button-hover trasnition-all duration-300 ease-in-out"
        >
          <div className="flex flex-col justify-center items-center h-60">
            {!imageSaved && (
              <div className="flex flex-col gap-6">
                <p className="text-xs font-lightmt-6">
                  {file ? `Uploading image ...` : 'Upload an image'}
                </p>
              </div>
            )}
          </div>
        </button>
        <div className="flex flex-col gap-6 my-6">
          <div className="flex flex-col gap-2">
            <input
              type="file"
              id="file"
              ref={inputFile}
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <input
              type="text"
              onChange={(e) => setContractNmae(e.target.value)}
              placeholder="Name"
              value={contractName}
              className="text-black font-semibold w-full border-b border-black py-2 text-sm placeholder-black placeholder:font-semibold"
            />
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description"
              ref={textAreaRef}
              className="text-black w-fullpy-2 text-sm placeholder-black w-full min-h-[100px] whitespace-pre-wrap"
            />
          </div>
        </div>
        <Button disabled={uploading} onClick={handleCreateContract}>
          {uploading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </div>
  );
}

export default CreatePost;
