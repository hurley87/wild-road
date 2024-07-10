'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Mint } from './mint';
import { Fragment } from 'react';
import Link from 'next/link';
import { FrameMetadata } from '@coinbase/onchainkit/frame';
import { Button } from '../ui/button';
import { Icons } from '../icons';
import { toast } from '../ui/use-toast';

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

  // reomve the first token as it is the collection token
  const contentTokens = tokens?.filter((token) => token.uid !== 1);

  console.log('tokens', tokens);

  const handleCopyLink = async () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/collect/${collection.collectionAddress}`
    );
    toast({
      title: 'Link copied',
    });
  };

  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-6 pb-10">
      <Mint
        text={collection.contractName}
        tokenContract={collectionAddress}
        uid={1}
      >
        <div className="text-4xl font-bold hover:shadow-md p-1 border border-white hover:border-stone-100 transition-all duration-200 ease-in-out w-fit rounded-sm cursor-pointer">
          {collection.contractName}
        </div>
      </Mint>
      <div className="flex justify-between w-full">
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
        {/* share button */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
        >
          <Icons.share className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {contentTokens?.map((token) => (
          <Fragment key={token._id}>
            {token.block !== null && (
              <Mint
                key={token.id}
                text={token.text}
                tokenContract={collectionAddress}
                uid={token.uid}
              >
                <button className="md:text-lg text-left hover:shadow-md hover:text-black p-1 border border-white hover:border-stone-100 transition-all duration-200 ease-in-out w-fit rounded-sm whitespace-pre-wrap">
                  {token.text}
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
          src: 'https://gateway.irys.xyz/mutable/iUwk2hoG8ST2KiExDz2njaeyF1h5Y-NQx0EmgPctf1s',
          aspectRatio: '1:1',
        }}
      />
    </div>
  );
}
