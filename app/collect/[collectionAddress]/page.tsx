import CollectPage from '@/components/collect/collect-page';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { getFrameMetadata } from '@coinbase/onchainkit/frame';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface CollectPageProps {
  params: { collectionAddress: string };
}

export default async function Collect({ params }: CollectPageProps) {
  const collectionAddress = params.collectionAddress as `0x${string}`;
  return <CollectPage collectionAddress={collectionAddress} />;
}

export async function generateMetadata({ params }: CollectPageProps) {
  const collectionAddress = params.collectionAddress as `0x${string}`;
  const collection = await fetchQuery(api.collections.getCollection, {
    collectionAddress,
  });
  const title = collection.contractName;
  const description = `written by ${collection.username} on ${new Date(
    collection._creationTime + 1000
  ).toDateString()}
  }`;

  const url = `${BASE_URL}/collect/${collectionAddress}`;
  const image =
    'https://gateway.irys.xyz/mutable/iUwk2hoG8ST2KiExDz2njaeyF1h5Y-NQx0EmgPctf1s';
  const target = `eip155:8453:${collectionAddress}:1`;
  const frameMetadata = getFrameMetadata({
    buttons: [
      {
        action: 'link',
        label: 'Read Online',
        target: url,
      },
      {
        label: 'Read Inline',
      },
      {
        action: 'mint',
        label: 'Mint',
        target,
      },
    ],
    image: {
      src: image,
      aspectRatio: '1:1',
    },
    postUrl: `${BASE_URL}/api/frame?collectionAddress=${collectionAddress}`,
    state: {
      uid: 1,
    },
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'ETF',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@seedclubhq',
      images: [image],
    },
    other: {
      ...frameMetadata,
    },
  };
}
