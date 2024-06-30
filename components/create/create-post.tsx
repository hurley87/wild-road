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
import { WebIrys } from '@irys/sdk';
import EditorJS from '@editorjs/editorjs';
import { Icons } from '../icons';
import TextareaAutosize from 'react-textarea-autosize';
import '@/styles/editor.css';
import { toast } from '../ui/use-toast';

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
        holder: 'editor',
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

  async function getWebIrys() {
    const network = 'devnet';
    const token = 'ethereum';

    const provider = await wallet?.getEthersProvider();
    if (!provider) throw new Error(`Cannot find privy wallet`);

    const irysWallet =
      wallet?.walletClientType === 'privy'
        ? { name: 'privy-embedded', provider, sendTransaction }
        : { name: 'privy', provider };

    const webIrys = new WebIrys({
      network,
      token,
      wallet: irysWallet,
    });

    await webIrys.ready();
    return webIrys; // Return the webIrys instance
  }

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

    const outputData = await ref.current?.save();
    const blocks = outputData?.blocks;

    if (contractName.length < 1) {
      toast({
        title: 'Please add a title',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    if (!blocks || blocks?.length === 0) {
      toast({
        title: 'Please write some content',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    const chainId = chain.id;
    const creatorClient = createCreatorClient({ chainId, publicClient });
    const { thumbnailFile } = await generateTextNftMetadataFiles(contractName);

    const webIrys = await getWebIrys(); // Get the webIrys instance

    try {
      const receipt = await webIrys.uploadFile(thumbnailFile);
      const uri = `https://gateway.irys.xyz/mutable/${receipt.id}`;
      console.log('Minting NFT with URI:', uri);

      const contractMetadata = {
        name: contractName,
        image: uri,
      };

      const contractMetadataReceipt = await webIrys.upload(
        JSON.stringify(contractMetadata)
      );
      const contractURI = `https://gateway.irys.xyz/mutable/${contractMetadataReceipt.id}`;
      console.log('Minting NFT with Metadata URI:', contractURI);

      const client = await walletClient;
      if (!client) {
        toast({
          title: 'Connect your wallet',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      const contract = {
        contractAdmin,
        contractName,
        contractURI,
      };

      const tokenText = contractName;
      const name =
        tokenText.length > 10 ? tokenText.slice(0, 10) + '...' : tokenText;

      const { thumbnailFile: tokenImage } =
        await generateTextNftMetadataFiles(tokenText);

      const tokenReceipt = await webIrys.uploadFile(tokenImage);
      const tokenURI = `https://gateway.irys.xyz/mutable/${tokenReceipt.id}`;
      console.log('Minting NFT with URI:', tokenURI);

      const tokenMetadata = {
        name,
        description: tokenText,
        image: tokenURI,
      };

      const tokenMetadataReceipt = await webIrys.upload(
        JSON.stringify(tokenMetadata)
      );
      const metadataURI = `https://gateway.irys.xyz/mutable/${tokenMetadataReceipt.id}`;
      console.log('Minting NFT with Metadata URI:', metadataURI);

      const { collectionAddress, premintConfig, signAndSubmit } =
        await creatorClient.createPremint({
          contract,
          token: {
            tokenURI: metadataURI,
            createReferral: '0x1D266998DA65E25DE8e1770d48e0E55DDEE39D24',
            mintStart: BigInt(0),
            mintDuration: BigInt(0),
            pricePerToken: BigInt(0),
            payoutRecipient: contractAdmin,
          },
        });

      await signAndSubmit({
        account: contractAdmin,
        walletClient: client,
        checkSignature: true,
      });

      const uid = premintConfig?.uid;

      await createCollection({
        collectionAddress,
        contractAdmin,
        contractName,
        username: farcaster?.username || 'anon',
        pfp:
          farcaster?.pfp ||
          'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/cdd23a72-ca58-49c3-9054-7f0ce3d42e00/original',
      });

      await createToken({
        uid,
        block: null,
        tokenURI,
        metadataURI,
        collectionAddress,
        contractAdmin,
      });

      for (const token of blocks) {
        const tokenText = token?.data?.text;
        const name =
          tokenText.length > 10 ? tokenText.slice(0, 10) + '...' : tokenText;

        const { thumbnailFile: tokenImage } =
          await generateTextNftMetadataFiles(tokenText);

        const tokenReceipt = await webIrys.uploadFile(tokenImage);
        const tokenURI = `https://gateway.irys.xyz/mutable/${tokenReceipt.id}`;
        console.log('Minting NFT with URI:', tokenURI);

        const tokenMetadata = {
          name,
          description: tokenText,
          image: tokenURI,
        };

        const tokenMetadataReceipt = await webIrys.upload(
          JSON.stringify(tokenMetadata)
        );
        const metadataURI = `https://gateway.irys.xyz/mutable/${tokenMetadataReceipt.id}`;
        console.log('Minting NFT with Metadata URI:', metadataURI);

        const { collectionAddress, premintConfig, signAndSubmit } =
          await creatorClient.createPremint({
            contract,
            token: {
              tokenURI: metadataURI,
              createReferral: '0x1D266998DA65E25DE8e1770d48e0E55DDEE39D24',
              mintStart: BigInt(0),
              mintDuration: BigInt(0),
              pricePerToken: BigInt(0),
              payoutRecipient: contractAdmin,
            },
          });

        await signAndSubmit({
          account: contractAdmin,
          walletClient: client,
          checkSignature: true,
        });

        const uid = premintConfig?.uid;

        await createToken({
          uid,
          block: token,
          tokenURI,
          metadataURI,
          collectionAddress,
          contractAdmin,
        });
      }

      router.push(`/collect/${collectionAddress}`);
    } catch (e) {
      console.log('Error uploading file ', e);
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
            <div id="editor" className="min-h-[500px]" />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
