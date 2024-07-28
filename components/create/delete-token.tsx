'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icons } from '../icons';
import { toast } from '../ui/use-toast';
import { Id } from '@/convex/_generated/dataModel';
import { getCreatorClient } from '@/lib/creatorClient';
import { useContractAdmin } from '@/hooks/useContractAdmin';

function DeleteToken({ tokenId }: { tokenId: Id<'tokens'> }) {
  const token = useQuery(api.tokens.getTokenById, {
    tokenId,
  });
  const deleteToken = useMutation(api.tokens.deleteToken);
  const { contractAdmin, walletClient } = useContractAdmin();
  const creatorClient = getCreatorClient();
  const [isDeletingToken, setIsDeletingToken] = useState(false);
  const collectionAddress = token?.collectionAddress;
  const tokenUid = token?.uid;

  const handleDelete = async () => {
    setIsDeletingToken(true);

    try {
      if (!token.zoraUrl) {
        const { signAndSubmit } = await creatorClient.deletePremint({
          collection: collectionAddress,
          uid: tokenUid,
        });

        const client = (await walletClient) as any;

        await signAndSubmit({
          account: contractAdmin,
          walletClient: client,
        });
      }

      await deleteToken({
        id: tokenId,
      });

      toast({
        description: 'Your token has been deleted',
      });

      setIsDeletingToken(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete.',
      });
      setIsDeletingToken(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="border rounded-md p-1"
      onClick={handleDelete}
    >
      {isDeletingToken ? (
        <Icons.spinner className="h-4 w-4 animate-spin" />
      ) : (
        <Icons.trash className="w-4 h-4" />
      )}
    </Button>
  );
}

export default DeleteToken;
