'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { createCreatorClient } from '@zoralabs/protocol-sdk';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import { useRouter } from 'next/navigation';
import { chain } from '@/constants/chain';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icons } from '../icons';
import TextareaAutosize from 'react-textarea-autosize';
import '@/styles/editor.css';
import { toast } from '../ui/use-toast';
import { getToken, getURI } from '@/lib/utils';
import Link from 'next/link';

const CHARACTER_COUNT_LIMIT = 777;

function CreatePost() {
  const { user, linkFarcaster, login } = usePrivy();
  const farcaster = user?.farcaster;
  const contractAdmin = user?.wallet?.address as `0x${string}`;
  const { wallets } = useWallets();
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const [contractName, setContractNmae] = useState('');
  const wallet = wallets.find((wallet) => wallet.address === contractAdmin);
  const walletClient = useWalletClient({ chain, wallet });
  const createCollection = useMutation(api.collections.create);
  const createToken = useMutation(api.tokens.create);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [tokens, setTokens] = useState<any[]>([
    {
      id: 2,
      text: '',
    },
  ]);

  const createPremint = async (contract: any, token: any) => {
    const chainId = chain.id;
    const creatorClient = createCreatorClient({ chainId, publicClient });

    const { collectionAddress, premintConfig, signAndSubmit } =
      await creatorClient.createPremint({
        contract,
        token,
      });

    const client = (await walletClient) as any;

    await signAndSubmit({
      account: contractAdmin,
      walletClient: client,
      checkSignature: true,
    });

    const uid = premintConfig?.uid;
    return {
      collectionAddress,
      uid,
    };
  };

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

    if (tokens?.length === 0) {
      toast({
        title: 'Please write some content',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    // check if any token is empty
    if (tokens.some((token) => token.text === '')) {
      toast({
        title: 'Please fill all the tokens',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    // check if any token is over the character limit
    if (tokens.some((token) => token.text.length > CHARACTER_COUNT_LIMIT)) {
      toast({
        title: 'Some tokens are over the character limit',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    try {
      const contractURI = await getURI(contractName);

      const contract = {
        contractAdmin,
        contractName,
        contractURI,
      };

      const token = await getToken(contractURI, contractAdmin);

      const { uid, collectionAddress } = await createPremint(contract, token);

      const username = farcaster?.username || 'anon';
      const pfp = farcaster?.pfp || '';

      await createCollection({
        collectionAddress,
        contractAdmin,
        contractName,
        username,
        pfp,
      });

      await createToken({
        uid,
        text: contractName,
        tokenURI: contractURI,
        collectionAddress,
        contractAdmin,
      });

      toast({
        title: `Created token #${uid}`,
        description: contractName,
      });

      for (const token of tokens) {
        const text = token?.text;
        const tokenURI = await getURI(token?.text);
        const tokenToSave = await getToken(tokenURI, contractAdmin);

        const { uid, collectionAddress } = await createPremint(
          contract,
          tokenToSave
        );

        await createToken({
          uid,
          text,
          tokenURI,
          collectionAddress,
          contractAdmin,
        });

        toast({
          title: `Created token #${uid}`,
          description: text,
        });
      }

      router.push(`/collect/${collectionAddress}`);
    } catch {
      toast({
        title: 'Error creating collection',
        variant: 'destructive',
      });
    }
  };

  const handleAddToken = () => {
    // only add a new token if the last token has text
    if (tokens[tokens.length - 1].text === '') {
      toast({
        title: 'Your last token is empty',
        variant: 'destructive',
      });
      return;
    }
    const newToken = {
      id: tokens.length + 2,
      text: '',
    };
    setTokens([...tokens, newToken]);
  };

  const handleTokenChange = (id: number, text: string) => {
    const newTokens = tokens.map((token) =>
      token.id === id ? { ...token, text } : token
    );
    setTokens(newTokens);
  };

  const deleteToken = (id: number) => {
    const newTokens = tokens.filter((token) => token.id !== id);
    setTokens(newTokens);
  };

  const getTokenCharacterCount = (id: number) => {
    return tokens.find((token) => token.id === id).text.length;
  };

  if (!user) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] py-4">
        <p className="text-sm text-muted-foreground text-center">
          Connect your wallet to get started.
        </p>
        <Button onClick={login}>Connect</Button>
        <p className="px-8 text-center text-sm text-black">
          <Link
            target="_blank"
            href="https://rainbow.me/en/"
            className="underline"
          >
            Don't have a wallet? Create one
          </Link>
        </p>
      </div>
    );
  }

  if (!farcaster) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] py-4">
        <p className="text-sm text-muted-foreground text-center">
          Link your Farcaster account to create a collection.
        </p>
        <Button onClick={linkFarcaster}>Link</Button>
        <p className="px-8 text-center text-sm text-black">
          <Link
            target="_blank"
            href="https://warpcast.com"
            className="underline"
          >
            Don't have an account? Sign Up
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto grid items-start">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full gap-6">
          <div className="prose prose-stone mx-auto w-full flex flex-col gap-4">
            <TextareaAutosize
              autoFocus
              id="title"
              defaultValue={contractName}
              placeholder="Collection title"
              className="resize-none appearance-none overflow-hidden bg-transparent text-3xl font-bold focus:outline-none w-full"
              onChange={(e) => setContractNmae(e.target.value)}
            />
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`flex items-start gap-4 border p-2 rounded-sm ${getTokenCharacterCount(token.id) > CHARACTER_COUNT_LIMIT && 'border-red-500'}`}
              >
                <div className="flex flex-col gap-4 w-full">
                  <TextareaAutosize
                    value={token.value}
                    className="resize-none appearance-none overflow-hidden bg-transparent font-medium focus:outline-none w-full"
                    placeholder="Write something..."
                    onChange={(e) =>
                      handleTokenChange(token.id, e.target.value)
                    }
                  />
                  {token.text !== '' && (
                    <div
                      className={`${getTokenCharacterCount(token.id) > CHARACTER_COUNT_LIMIT && 'text-red-500'} text-xs italic`}
                    >
                      {getTokenCharacterCount(token.id)}/{CHARACTER_COUNT_LIMIT}
                    </div>
                  )}
                </div>
                {token.id !== 2 && (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="border rounded-md p-1"
                      onClick={() => deleteToken(token.id)}
                    >
                      <Icons.trash className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddToken}
              >
                Add Text
              </Button>
            </div>
          </div>
          <div className="flex w-full justify-end">
            <Button type="submit">
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Publish</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
