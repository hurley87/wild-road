'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import {
  createCreatorClient,
  generateTextNftMetadataFiles,
} from '@zoralabs/protocol-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import { useRouter } from 'next/navigation';
import { chain } from '@/constants/chain';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import EditorJS from '@editorjs/editorjs';
import { Icons } from '../icons';
import TextareaAutosize from 'react-textarea-autosize';
import '@/styles/editor.css';
import { toast } from '../ui/use-toast';
import { getWebIrys } from '@/lib/utils';

const IRYS_URL = 'https://gateway.irys.xyz/mutable/';
const REF = 'editor';

function CreatePost() {
  const ref = useRef<EditorJS>();
  const { user, sendTransaction } = usePrivy();
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
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    // const List = (await import('@editorjs/list')).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: REF,
        onReady() {
          ref.current = editor;
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: false,
        data: {
          time: new Date().getTime(),
          blocks: [],
          version: '2.22.2',
        },
        tools: {
          // list: List,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      initializeEditor();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const getUri = async (text: string) => {
    const provider = await wallet?.getEthersProvider();
    if (!provider || wallet?.walletClientType !== 'privy')
      throw new Error(`Cannot find privy wallet`);

    const webIrys = await getWebIrys({
      name: 'privy-embedded',
      provider,
      sendTransaction,
    });

    const name = text.length > 10 ? text.slice(0, 10) + '...' : text;

    const { thumbnailFile } = await generateTextNftMetadataFiles(contractName);
    const tokenReceipt = await webIrys.uploadFile(thumbnailFile);
    const tokenURI = `${IRYS_URL}${tokenReceipt.id}`;

    const tokenMetadata = {
      name,
      description: text,
      image: tokenURI,
    };

    const tokenMetadataReceipt = await webIrys.upload(
      JSON.stringify(tokenMetadata)
    );

    return `${IRYS_URL}${tokenMetadataReceipt.id}`;
  };

  const getToken = async (tokenURI: string) => {
    const createReferral = process.env.NEXT_PUBLIC_REFERRAL as `0x${string}`;
    return {
      tokenURI,
      createReferral,
      mintStart: BigInt(0),
      mintDuration: BigInt(0),
      pricePerToken: BigInt(0),
      payoutRecipient: contractAdmin,
    };
  };

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
        title: 'Please add a title',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    const outputData = await ref.current?.save();
    const blocks = outputData?.blocks;

    if (!blocks || blocks?.length === 0) {
      toast({
        title: 'Please write some content',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    try {
      const contractURI = await getUri(contractName);

      const contract = {
        contractAdmin,
        contractName,
        contractURI,
      };

      const token = await getToken(contractURI);

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

      toast({
        title: 'Created Collectiom',
        description: collectionAddress,
      });

      await createToken({
        uid,
        block: null,
        tokenURI: contractURI,
        collectionAddress,
        contractAdmin,
      });

      toast({
        title: `Created token #${uid}`,
        description: contractName,
      });

      for (const block of blocks) {
        const tokenText = block?.data?.text;
        const tokenURI = await getUri(block?.data?.text);
        const token = await getToken(tokenURI);

        const { uid, collectionAddress } = await createPremint(contract, token);

        await createToken({
          uid,
          block,
          tokenURI,
          collectionAddress,
          contractAdmin,
        });

        toast({
          title: `Created token #${uid}`,
          description: tokenText,
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

  return (
    <div className="max-w-3xl w-full mx-auto grid items-start">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full gap-6">
          <div>
            <Button type="submit">
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Publish</span>
            </Button>
          </div>
          <div className="prose prose-stone mx-auto w-full">
            <TextareaAutosize
              autoFocus
              id="title"
              defaultValue={contractName}
              placeholder="Post title"
              className="resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none w-full"
              onChange={(e) => setContractNmae(e.target.value)}
            />
            <div id={REF} className="min-h-[500px]" />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
