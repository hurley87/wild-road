'use client';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useToast } from '../ui/use-toast';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ToastAction } from '../ui/toast';
import Link from 'next/link';
import { Icons } from '../icons';
import { Comments } from './comments';
import { getCollectorClient } from '@/lib/collectorClient';
import useWalletClient from '@/hooks/useWalletClient';
import { Id } from '@/convex/_generated/dataModel';

export function TokenMint({
  children,
  tokenId,
  showMint,
}: {
  children: React.ReactNode;
  tokenId: Id<'tokens'>;
  showMint: boolean;
}) {
  const { user, login } = usePrivy();
  const { wallets } = useWallets();
  console.log('user', user);
  const minterAccount = user?.wallet?.address as `0x${string}`;
  console.log('minterAccount', minterAccount);
  const wallet = wallets.find((wallet) => wallet.address === minterAccount);
  const walletClient = useWalletClient({ wallet });
  const [quantityToMint, setQuantityToMint] = useState(1);
  const [mintComment, setMintComment] = useState('');
  const collectorClient = getCollectorClient();
  const create = useMutation(api.mints.create);
  const { toast } = useToast();
  const [isMinting, setIsMinting] = useState(false);
  const token = useQuery(api.tokens.getTokenById, {
    tokenId,
  });
  const text = token?.text;
  const tokenContract = token?.collectionAddress;
  const uid = token?.uid;

  const handleMint = async () => {
    setIsMinting(true);

    let mintParams = {
      tokenContract,
      mintType: 'premint',
      uid,
      quantityToMint,
      mintComment,
      minterAccount,
    } as any;

    if (token?.zoraUrl) {
      const mintReferral = process.env.NEXT_PUBLIC_REFERRAL;
      mintParams = {
        tokenContract,
        mintType: '1155',
        tokenId: uid,
        mintReferral,
        mintComment,
        quantityToMint,
      };
    }

    console.log('mintParams', mintParams);

    try {
      const { parameters } = await collectorClient.mint(mintParams);

      const client = (await walletClient) as any;

      const hash = await client.writeContract(parameters);

      await create({
        uid,
        tokenContract,
        mintComment,
        minterAccount,
        quantityToMint,
      });

      toast({
        title: 'Success',
        description: 'View mint transaction on Basescan.',
        action: (
          <Link target="_blank" href={`https://basescan.org/tx/${hash}`}>
            <ToastAction altText="Goto explorer">View</ToastAction>
          </Link>
        ),
      });

      setIsMinting(false);
      setMintComment('');
      setQuantityToMint(1);
    } catch (e) {
      console.log('error', e);
      toast({
        title: 'Error',
        description: 'Failed to mint.',
      });
      setIsMinting(false);
      return;
    }
  };

  return (
    <Sheet defaultOpen={showMint}>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent className="h-screen overflow-auto">
        <SheetHeader>
          <SheetTitle>Comment & Mint</SheetTitle>
          <SheetDescription>
            <div className="flex flex-col gap-3">
              {token?.image !== '' ? (
                <img
                  src={token?.image}
                  alt={token?.imageName}
                  className="w-full h-auto rounded-md my-3"
                />
              ) : (
                <div className="text-xs h-80 w-full rounded-sm p-2 border overflow-auto whitespace-pre-wrap text-left">
                  {text}
                </div>
              )}

              <div className="py-0 w-3/4 mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => {
                      if (quantityToMint !== 1) {
                        setQuantityToMint(quantityToMint - 1);
                      }
                    }}
                  >
                    <MinusIcon className="h-4 w-4" />
                    <span className="sr-only">Decrease</span>
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold tracking-tighter">
                      {quantityToMint}
                    </div>
                    <div className="text-xs uppercase text-muted-foreground">
                      {0.000777 * quantityToMint} ETH
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => setQuantityToMint(quantityToMint + 1)}
                    disabled={quantityToMint >= 400}
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span className="sr-only">Increase</span>
                  </Button>
                </div>
              </div>
              <div className="px-0 w-full flex flex-col gap-6">
                {user && wallet ? (
                  <div className="w-full">
                    <Input
                      type="text"
                      placeholder="Add a comment ..."
                      className="rounded-b-none"
                      value={mintComment}
                      onChange={(e) => setMintComment(e.target.value)}
                    />
                    <Button
                      className="w-full rounded-t-none"
                      size="lg"
                      disabled={isMinting}
                      onClick={handleMint}
                    >
                      {isMinting && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isMinting ? 'Minting ...' : 'Mint'}
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={login}>
                    Login
                  </Button>
                )}
                <Comments tokenContract={tokenContract} uid={uid} />
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
