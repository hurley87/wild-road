'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Comment } from './comment';

export function Comments({ tokenContract }: { tokenContract: string }) {
  if (!tokenContract) return null;
  const comments = useQuery(api.mints.getCollectionTokens, {
    tokenContract,
  });

  if (!comments) return null;

  return (
    <div className="max-h-16 overflow-auto flex flex-col gap-3">
      {comments
        .filter((comment) => comment.mintComment.length > 0)
        .sort((a: any, b: any) => b.quantityToMint - a.quantityToMint)
        .map((mint: any) => {
          return <Comment mint={mint} key={mint._id} />;
        })}
    </div>
  );
}
