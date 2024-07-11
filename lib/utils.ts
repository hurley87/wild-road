import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WebIrys } from '@irys/sdk';
import { generateTextNftMetadataFiles } from '@zoralabs/protocol-sdk';

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
  await fetch('/api/lazyFund', {
    method: 'POST',
    body: selectedFile.size.toString(),
  });

  // Create a new WebIrys object using the provider created with server info.
  const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
  const token = process.env.NEXT_PUBLIC_TOKEN || '';
  const wallet = { name: 'ethersv5', provider: provider };
  //@ts-ignore
  const irys = new WebIrys({ network, token, wallet });

  await irys.ready();

  const tx = await irys.uploadFile(selectedFile, {
    tags,
  });

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

export const getImage = async (uri: string) => {
  if (!uri) return '';
  const metadata = await fetch(uri);
  const metadataJson = await metadata.json();
  const image = metadataJson.image.replace('/mutable/', '/');
  return image;
};

const IRYS_URL = 'https://gateway.irys.xyz/';

export const getURI = async (text: string, code?: null) => {
  const name = text.length > 10 ? text.slice(0, 10) + '...' : text;
  const { thumbnailFile } = await generateTextNftMetadataFiles(text);

  const tags = [{ name: 'Content-Type', value: 'image/png' }];
  if (code) tags.push({ name: 'Root-TX', value: code });

  const id = await gaslessFundAndUploadSingleFile(thumbnailFile, tags);

  const receiptId = await uploadMetadata({
    name,
    description: text,
    image: `${IRYS_URL}${id}`,
  });

  return `${IRYS_URL}${receiptId}`;
};

export const getToken = async (
  tokenURI: string,
  payoutRecipient: `0x${string}`
) => {
  const createReferral = process.env.NEXT_PUBLIC_REFERRAL as `0x${string}`;
  return {
    tokenURI,
    createReferral,
    mintStart: BigInt(0),
    mintDuration: BigInt(0),
    pricePerToken: BigInt(0),
    payoutRecipient,
  };
};

// https://gateway.irys.xyz/M7v0FTPCM3GCMp6lThrZEryeT5O4TyxF6d58F5VheX8
// https://gateway.irys.xyz/CO9EpX0lekJEfXUOeXncUmMuG8eEp5WJHXl9U9yZUYA
