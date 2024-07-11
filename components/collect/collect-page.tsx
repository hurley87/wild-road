'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TokenMint } from './token-mint';
import { Fragment } from 'react';
import Link from 'next/link';
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
      <div className="text-4xl font-bold p-1">{collection.contractName}</div>
      <Link
        target="_blank"
        href={`https://warpcast.com/${collection.username}`}
      >
        <div className="flex items-center space-x-4 px-1">
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
      <div className="px-1">
        <div className="border border-y border-x-0 flex justify-between py-1">
          <TokenMint tokenContract={collectionAddress} uid={1}>
            <Icons.chat className="w-4 h-4" />
          </TokenMint>
          <Button
            onClick={handleCopyLink}
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
          >
            <Icons.share className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {contentTokens?.map((token) => (
          <Fragment key={token._id}>
            {token.block !== null && (
              <TokenMint
                key={token.id}
                tokenContract={collectionAddress}
                uid={token.uid}
              >
                <button className="md:text-lg text-left hover:shadow-md hover:text-black p-1 border border-white hover:border-stone-100 transition-all duration-200 ease-in-out w-fit rounded-sm whitespace-pre-wrap">
                  {token.text}
                </button>
              </TokenMint>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
