'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import DeleteToken from './delete-token';
import UpdateToken from './update-token';
import { Id } from '@/convex/_generated/dataModel';

function EditCollectionTokens({ id }: { id: Id<'collections'> }) {
  const tokensQuery = useQuery(api.tokens.getCollectionTokens, {
    id,
  });

  const tokens = (tokensQuery || []).slice(1);

  return (
    <div className="w-full flex flex-col gap-6">
      {tokens.map((token) => (
        <div className="flex flex-col gap-1" key={token.id}>
          <div className="flex justify-end gap-1">
            <UpdateToken tokenId={token._id} />
            <DeleteToken tokenId={token._id} />
          </div>
          <div className="flex gap-4 w-full">
            {token.image !== '' ? (
              <img
                src={token.image}
                alt={token.imageName}
                className="w-1/2 mx-auto h-auto rounded-md"
              />
            ) : (
              <div className="whitespace-pre-wrap">{token.text}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EditCollectionTokens;
