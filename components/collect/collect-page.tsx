'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Mint } from './mint';
import { Fragment } from 'react';
import Link from 'next/link';
import { FrameMetadata } from '@coinbase/onchainkit/frame';

export default function CollectPage({
  collectionAddress,
}: {
  collectionAddress: `0x${string}`;
}) {
  const collection = useQuery(api.collections.getCollection, {
    collectionAddress,
  });
  const tokens = useQuery(api.tokens.getCollectionTokens, {
    collectionAddress,
  });

  if (!collection) return null;

  const date = new Date(collection._creationTime + 1000);
  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
      <Link
        target="_blank"
        href={`https://warpcast.com/${collection.username}`}
      >
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={collection.pfp} alt="Image" />
            <AvatarFallback>--</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">
              {collection.username}
            </p>
            <p className="text-sm text-muted-foreground">
              {date.toDateString()}
            </p>
          </div>
        </div>
      </Link>
      <Mint
        text={collection.contractName}
        tokenContract={collectionAddress}
        uid={1}
      >
        <div className="text-4xl font-bold hover:shadow-lg  p-1 hover:border transition-all duration-200 ease-in-out w-fit rounded-sm cursor-pointer">
          {collection.contractName}
        </div>
      </Mint>

      <div className="flex flex-col gap-2">
        {tokens?.map((token) => (
          <Fragment key={token._id}>
            {token.block !== null && (
              <Mint
                key={token.id}
                text={token.block.data.text}
                tokenContract={collectionAddress}
                uid={token.uid}
              >
                <button className="md:text-lg text-left hover:shadow-lg hover:text-black p-1 border border-white hover:border-stone-300 transition-all duration-200 ease-in-out w-fit rounded-sm">
                  {token.block.data.text.replace('&nbsp;', ' ')}
                </button>
              </Mint>
            )}
          </Fragment>
        ))}
      </div>
      <FrameMetadata
        buttons={[
          {
            action: 'link',
            label: 'Mint',
            target: `https://zora.co/collect/base:${collection.collectionAddress}`,
          },
        ]}
        image={{
          src: tokens?.[0]?.tokenURI,
          aspectRatio: '1:1',
        }}
      />
    </div>
  );
}
