'use client';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '../ui/button';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icons } from '../icons';
import Link from 'next/link';
import CreateTextToken from './create-text-token';
import CreateImageToken from './create-image-token';
import EditCollectionTokens from './edit-collection-tokens';

function EditCollection({
  collectionAddress,
}: {
  collectionAddress: `0x${string}`;
}) {
  const collection = useQuery(api.collections.getCollection, {
    collectionAddress,
  });
  const { user, ready } = usePrivy();
  const contractAdmin = user?.wallet?.address as `0x${string}`;

  if (ready && contractAdmin !== collection?.contractAdmin) {
    return (
      <div className="text-sm text-muted-foreground text-center">
        Only the creator can edit this collection
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full mx-auto grid items-start">
      <div className="flex w-full justify-end">
        <Link target="_blank" href={`/collect/${collectionAddress}`}>
          <Button variant="outline">
            <span>View Collection</span>
            <Icons.chevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid w-full gap-6">
        <div className="text-4xl font-bold">{collection?.contractName}</div>
        <div className="prose prose-stone mx-auto w-full flex flex-col gap-6">
          <EditCollectionTokens collectionAddress={collectionAddress} />
          <div className="flex gap-2 pb-6">
            <CreateTextToken
              contractName={collection?.contractName}
              contractURI={collection?.contractURI}
            />
            <CreateImageToken
              contractName={collection?.contractName}
              contractURI={collection?.contractURI}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCollection;
