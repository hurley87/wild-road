import CollectPage from '@/components/collect/collect-page';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import { BASE_URL, IRYS_URL } from '@/constants/common';

interface CollectPageProps {
  params: { collectionAddress: string };
}

export default async function Collect({ params }: CollectPageProps) {
  const collectionAddress = params.collectionAddress as `0x${string}`;
  return <CollectPage collectionAddress={collectionAddress} />;
}

export async function generateMetadata({ params }: CollectPageProps) {
  const collectionAddress = params.collectionAddress as `0x${string}`;
  const order = 1;
  const collection = await fetchQuery(api.collections.getCollection, {
    collectionAddress,
  });
  const token = await fetchQuery(api.tokens.getTokenByOrder, {
    collectionAddress,
    order: 1,
  });
  const title = collection.contractName;
  const description = `written by ${collection.username} on ${new Date(
    collection._creationTime + 1000
  ).toDateString()}
  }`;
  const url = `${BASE_URL}/collect/${collectionAddress}`;
  const src = `${IRYS_URL}${token.imageCode}`;
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
        target: `${url}?t=${order}`,
      },
    ],
    image: {
      src,
      aspectRatio: '1:1',
    },
    postUrl: `${BASE_URL}/api/frame?collectionAddress=${collectionAddress}`,
    state: {
      order,
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
      images: [src],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@seedclubhq',
      images: [src],
    },
    other: {
      ...frameMetadata,
    },
  };
}
