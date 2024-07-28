'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TokenMint } from './token-mint';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Icons } from '../icons';
import { usePrivy } from '@privy-io/react-auth';
import Share from './share';
import { useSearchParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';

export default function CollectPage({
  collectionAddress,
}: {
  collectionAddress: `0x${string}`;
}) {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const collection = useQuery(api.collections.getCollection, {
    collectionAddress,
  });

  const id = collection?._id as Id<'collections'>;
  const tokens = useQuery(api.tokens.getCollectionTokens, {
    id,
  });

  if (!collection) return null;

  const date = new Date(collection._creationTime + 1000);
  const [firstToken, ...contentTokens] = tokens || [];
  const contractAdmin = collection?.contractAdmin;
  const isAdmin = address === contractAdmin;

  console.log('tokens', tokens);

  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-6 pb-10">
      <div className="text-4xl font-bold">{collection?.contractName}</div>
      <Link href={`/profile/${collection?.contractAdmin}`}>
        <div className="flex items-center space-x-4 px-1">
          <Avatar>
            <AvatarImage src={collection.pfp} alt="Image" />
            <AvatarFallback>--</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium leading-none">
              {collection.username}
            </div>
            <div className="text-sm text-muted-foreground">
              {date.toDateString()}
            </div>
          </div>
        </div>
      </Link>
      <div className="px-1">
        <div className="border border-y border-x-0 flex justify-between py-1">
          {firstToken && (
            <TokenMint showMint={uid === '1'} tokenId={firstToken._id}>
              <Icons.chat className="w-4 h-4" />
            </TokenMint>
          )}
          <div className="flex gap-1">
            {isAdmin && (
              <Link href={`/create/${collectionAddress}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <Icons.pencil className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Share collectionAddress={collectionAddress} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {contentTokens?.map((token) => (
          <TokenMint
            key={token._id}
            tokenId={token._id}
            showMint={token.uid.toString() === uid}
          >
            {token.image !== '' ? (
              <img
                src={token.image}
                alt={token.imageName}
                className="w-1/2 mx-auto h-auto rounded-md"
              />
            ) : (
              <button className="md:text-lg text-left hover:shadow-md hover:text-black p-1 border border-white hover:border-stone-100 transition-all duration-200 ease-in-out w-fit rounded-sm whitespace-pre-wrap w-full">
                {token.text}
              </button>
            )}
          </TokenMint>
        ))}
      </div>
    </div>
  );
}
