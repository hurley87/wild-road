'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Avatar, AvatarImage } from '../ui/avatar';

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
          return (
            <div className="flex items-center gap-2 text-xs" key={mint.id}>
              <Avatar className="h-4 w-4">
                <AvatarImage
                  alt="Picture"
                  src={`https://zora.co/api/avatar/${mint.minterAccount}?size=36`}
                />
              </Avatar>
              <div className="font-semibold">
                {mint.minterAccount.slice(0, 4)}...
                {mint.minterAccount.slice(-4)}
              </div>
              <p>{mint.mintComment}</p>
            </div>
          );
        })}
    </div>
  );
}
