'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Idea from './idea';

export function ProfileIdeas({
  walletAddress,
}: {
  walletAddress: `0x${string}`;
}) {
  const ideas = useQuery(api.mints.getIdeas, {
    minterAccount: walletAddress,
  });

  if (!ideas) return null;

  return (
    <div className="w-full flex flex-col gap-6  py-6">
      {ideas.map((idea) => (
        <Idea key={idea._id} tokenId={idea.tokenId} />
      ))}
      {ideas.length === 0 && (
        <div className="text-muted-foreground text-lg font-bold">
          You haven't collected any ideas yet
        </div>
      )}
    </div>
  );
}
