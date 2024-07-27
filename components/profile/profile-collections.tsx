'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

export function ProfileCollections({
  walletAddress,
}: {
  walletAddress: `0x${string}`;
}) {
  const collections = useQuery(api.collections.getCollections, {
    contractAdmin: walletAddress,
  });

  if (!collections) return null;

  return (
    <div className="w-full flex flex-col gap-6 py-6">
      {collections.map((collection) => (
        <Link
          href={`/create/${collection.collectionAddress}`}
          className="underline text-4xl font-bold"
          key={collection._id}
        >
          {collection.contractName}
        </Link>
      ))}
      {collections.length === 0 && (
        <div className="text-muted-foreground text-lg font-bold">
          No collections yet
        </div>
      )}
    </div>
  );
}
