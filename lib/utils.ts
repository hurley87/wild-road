import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WebIrys } from '@irys/sdk';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(address: string) {
  return `https://zora.co/api/avatar/${address}?size=36`;
}

export function formatAddress(address: string) {
  return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
}

// Define the Tag type
type Tag = {
  name: string;
  value: string;
};

export const gaslessFundAndUploadSingleFile = async (
  selectedFile: File,
  tags: Tag[]
): Promise<string> => {
  // obtain the server's public key
  const pubKeyRes = (await (
    await fetch('/api/publicKey')
  ).json()) as unknown as {
    pubKey: string;
  };
  const pubKey = Buffer.from(pubKeyRes.pubKey, 'hex');

  console.log('pubKey: ', pubKey.toString());

  // Create a provider - this mimics the behaviour of the injected provider, i.e metamask
  const provider = {
    // for ETH wallets
    getPublicKey: async () => {
      return pubKey;
    },
    getSigner: () => {
      return {
        getAddress: () => pubKey.toString(), // pubkey is address for TypedEthereumSigner
        _signTypedData: async (
          _domain: never,
          _types: never,
          message: { address: string; 'Transaction hash': Uint8Array }
        ) => {
          const convertedMsg = Buffer.from(
            message['Transaction hash']
          ).toString('hex');
          console.log('convertedMsg: ', convertedMsg);
          const res = await fetch('/api/signData', {
            method: 'POST',
            body: JSON.stringify({ signatureData: convertedMsg }),
          });
          const { signature } = await res.json();
          const bSig = Buffer.from(signature, 'hex');
          // Pad & convert so it's in the format the signer expects to have to convert from.
          const pad = Buffer.concat([
            Buffer.from([0]),
            Buffer.from(bSig),
          ]).toString('hex');
          return pad;
        },
      };
    },

    _ready: () => {},
  };

  // You can delete the lazyFund route if you're prefunding all uploads
  const fundTx = await fetch('/api/lazyFund', {
    method: 'POST',
    body: selectedFile.size.toString(),
  });

  console.log('fundTx: ', fundTx);

  // Create a new WebIrys object using the provider created with server info.
  const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
  const token = process.env.NEXT_PUBLIC_TOKEN || '';

  const wallet = { name: 'ethersv5', provider: provider };
  //@ts-ignore
  const irys = new WebIrys({ network, token, wallet });

  const w3signer = await provider.getSigner();
  await irys.ready();

  console.log('Uploading irys=', irys);
  const tx = await irys.uploadFile(selectedFile, {
    tags,
  });
  console.log(`Uploaded successfully. https://gateway.irys.xyz/${tx.id}`);

  return tx.id;
};

export const uploadMetadata = async (metadata: any) => {
  const res = await fetch('/api/uploadMetadata', {
    method: 'POST',
    body: JSON.stringify(metadata),
  });
  const { receiptId } = await res.json();
  return receiptId;
};
