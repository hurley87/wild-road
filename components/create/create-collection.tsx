'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from '../ui/use-toast';
import { getToken, getTextCodes } from '@/lib/utils';
import Link from 'next/link';
import createPremint from '@/lib/premint';
import { IRYS_URL } from '@/constants/common';
import { useContractAdmin } from '@/hooks/useContractAdmin';

function CreatePost() {
  const { user, linkFarcaster, login } = usePrivy();
  const farcaster = user?.farcaster;
  const { contractAdmin, walletClient } = useContractAdmin();
  const createCollection = useMutation(api.collections.create);
  const createToken = useMutation(api.tokens.create);
  const router = useRouter();
  const [contractName, setContractName] = useState('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);

    if (!farcaster) {
      toast({
        title: 'Please logout and login with Farcaster.',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    if (contractName.length < 1) {
      toast({
        title: 'Please add a collection title',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    try {
      const { metadataCode, imageCode } = await getTextCodes(contractName);

      const contractURI = `${IRYS_URL}${metadataCode}`;
      const contract = {
        contractAdmin,
        contractName,
        contractURI,
      };

      const token = await getToken(contractURI, contractAdmin);

      const { uid, collectionAddress } = await createPremint(
        contract,
        token,
        contractAdmin,
        walletClient
      );

      const username = farcaster?.username as string;
      const pfp = farcaster?.pfp as string;

      const collectionId = await createCollection({
        collectionAddress,
        contractAdmin,
        contractName,
        contractURI,
        username,
        pfp,
      });

      await createToken({
        uid,
        collectionId,
        text: contractName,
        collectionAddress,
        contractAdmin,
        metadataCode,
        imageCode,
        image: '',
        imageDescription: '',
        imageName: '',
      });

      toast({
        title: `Collection created`,
        description: contractName,
      });

      router.push(`/create/${collectionAddress}`);
    } catch {
      toast({
        title: 'Error creating collection',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }
  };

  if (!user) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] py-4">
        <div className="text-sm text-muted-foreground text-center">
          Connect your wallet to get started.
        </div>
        <Button onClick={login}>Connect</Button>
        <div className="px-8 text-center text-sm text-black">
          <Link
            target="_blank"
            href="https://rainbow.me/en/"
            className="underline"
          >
            Don't have a wallet? Create one
          </Link>
        </div>
      </div>
    );
  }

  if (!farcaster) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] py-4">
        <div className="text-sm text-muted-foreground text-center">
          Link your Farcaster account to create a collection.
        </div>
        <Button onClick={linkFarcaster}>Link</Button>
        <div className="px-8 text-center text-sm text-black">
          <Link
            target="_blank"
            href="https://warpcast.com"
            className="underline"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full mx-auto grid items-start">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 pt-6">
          <TextareaAutosize
            autoFocus
            id="title"
            defaultValue={contractName}
            placeholder="Collection title"
            className="resize-none appearance-none overflow-hidden bg-transparent text-3xl font-bold focus:outline-none w-full"
            onChange={(e) => setContractName(e.target.value)}
          />
          <div>
            <Button disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create collection'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
