'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ProfileCollection } from './profile-collection';

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
        <ProfileCollection key={collection._id} id={collection._id} />
      ))}
      {collections.length === 0 && (
        <div className="text-muted-foreground text-lg font-bold">
          You haven't created any ideas yet
        </div>
      )}
    </div>
  );
}
