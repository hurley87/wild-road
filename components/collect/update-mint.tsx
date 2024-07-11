'use client';
import { Button } from '@/components/ui/button';
import { chain } from '@/constants/chain';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { createCreatorClient } from '@zoralabs/protocol-sdk';
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useToast } from '../ui/use-toast';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getToken, getURI } from '@/lib/utils';
import useWalletClient from '@/hooks/useWalletClient';
import { Icons } from '../icons';
import { Id } from '@/convex/_generated/dataModel';

export function UpdateMint({
  text,
  tokenContract,
  uid,
  contractAdmin,
  tokenId,
}: {
  text: string;
  tokenContract: `0x${string}`;
  uid: number;
  contractAdmin: `0x${string}`;
  tokenId: Id<'tokens'>;
}) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const minterAccount = user?.wallet?.address as `0x${string}`;
  const wallet = wallets.find((wallet) => wallet.address === minterAccount);
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatedText, setUpdatedText] = useState(text);
  const chainId = chain.id;
  const creatorClient = createCreatorClient({ chainId, publicClient });
  const walletClient = useWalletClient({ chain, wallet });
  const updateToken = useMutation(api.tokens.updateToken);
  const deleteToken = useMutation(api.tokens.deleteToken);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const tokenURI = await getURI(updatedText);

      const token = await getToken(tokenURI, contractAdmin);

      const { signAndSubmit } = await creatorClient.updatePremint({
        collection: tokenContract,
        uid,
        tokenConfigUpdates: {
          ...token,
        },
      });

      const client = (await walletClient) as any;

      await signAndSubmit({
        account: contractAdmin,
        walletClient: client,
        checkSignature: true,
      });

      await updateToken({
        text: updatedText,
        tokenURI,
        id: tokenId,
      });

      toast({
        title: 'Success',
        description: 'Your token has been updated.',
      });
      setIsUpdating(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update.',
      });
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { signAndSubmit } = await creatorClient.deletePremint({
        collection: tokenContract,
        uid,
      });

      const client = (await walletClient) as any;

      await signAndSubmit({
        account: contractAdmin,
        walletClient: client,
      });

      await deleteToken({
        id: tokenId,
      });

      toast({
        title: 'Success',
        description: 'Your token has been deleted.',
      });
      setIsDeleting(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete.',
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <textarea
        className="text-xs h-96 overflow-auto w-full rounded-t-sm p-2 border whitespace-pre-wrap border-b-0"
        value={updatedText}
        onChange={(e) => setUpdatedText(e.target.value)}
      />
      <Button
        disabled={isUpdating}
        className="rounded-none border-b-0"
        onClick={handleUpdate}
      >
        {isUpdating && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Update
      </Button>
      {uid !== 1 && (
        <Button
          className="rounded-b-sm rounded-t-none"
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Delete
        </Button>
      )}
    </div>
  );
}
