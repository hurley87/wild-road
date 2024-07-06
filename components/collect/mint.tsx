'use client';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { chain } from '@/constants/chain';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { createCollectorClient } from '@zoralabs/protocol-sdk';
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useToast } from '../ui/use-toast';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ToastAction } from '../ui/toast';
import Link from 'next/link';
import { Icons } from '../icons';
import { Comments } from './comments';

export function Mint({
  children,
  text,
  tokenContract,
  uid,
}: {
  children: React.ReactNode;
  text: string;
  tokenContract: `0x${string}`;
  uid: number;
}) {
  const { user, login } = usePrivy();
  const { wallets } = useWallets();
  const minterAccount = user?.wallet?.address as `0x${string}`;
  const wallet = wallets.find((wallet) => wallet.address === minterAccount);
  const [quantityToMint, setQuantityToMint] = useState(1);
  const [mintComment, setMintComment] = useState('');
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const create = useMutation(api.mints.create);
  const { toast } = useToast();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    setIsMinting(true);
    const chainId = chain.id;
    const collectorClient = createCollectorClient({ chainId, publicClient });

    try {
      const { parameters } = await collectorClient.mint({
        tokenContract,
        mintType: 'premint',
        uid,
        quantityToMint,
        mintComment,
        minterAccount,
      });

      const ethereumProvider = (await wallet?.getEthereumProvider()) as any;
      const walletClient = await createWalletClient({
        account: minterAccount,
        chain,
        transport: custom(ethereumProvider),
      });
      const hash = await walletClient.writeContract(parameters);

      await publicClient.waitForTransactionReceipt({
        hash,
      });

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
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mint.',
      });
      setIsMinting(false);
      return;
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="hidden">
          <DrawerTitle>Mint</DrawerTitle>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="px-4 flex flex-col gap-3">
            <div className="text-lg h-80 w-full rounded-sm p-2 border">
              {text.replace('&nbsp;', ' ')}
            </div>
            <Input
              type="text"
              placeholder="What are your thoughts?"
              value={mintComment}
              onChange={(e) => setMintComment(e.target.value)}
            />
          </div>
          <div className="p-4 pb-0">
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
                <div className="text-7xl font-bold tracking-tighter">
                  {quantityToMint}
                </div>
                <div className="text-sm uppercase text-muted-foreground">
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
          <DrawerFooter>
            {user ? (
              <Button disabled={isMinting} onClick={handleMint}>
                {isMinting && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isMinting ? 'Minting ...' : 'Mint'}
              </Button>
            ) : (
              <Button onClick={login}>Login</Button>
            )}

            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Comments tokenContract={tokenContract} />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
