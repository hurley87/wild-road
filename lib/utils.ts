import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WebIrys } from '@irys/sdk';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getWebIrys(wallet: any, sendTransaction: any) {
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
