'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

function Idea({ tokenId }: { tokenId: Id<'tokens'> }) {
  const token = useQuery(api.tokens.getTokenById, {
    tokenId,
  });

  if (!token) return null;

  return (
    <Link
      href={`/collect/${token.collectionAddress}`}
      className="whitespace-pre-wrap"
    >
      {token.image !== '' ? (
        <img
          src={token.image}
          alt={token.imageName}
          className="w-1/2 mx-auto h-auto rounded-md"
        />
      ) : (
        token.text
      )}
    </Link>
  );
}
export default Idea;
