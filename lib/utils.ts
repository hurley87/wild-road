import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WebIrys } from '@irys/sdk';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getWebIrys(wallet: any) {
  const network = 'devnet';
  const token = 'base-eth';

  const webIrys = new WebIrys({
    network,
    token,
    wallet,
  });

  await webIrys.ready();
  return webIrys;
}

export function getAvatarUrl(address: string) {
  return `https://zora.co/api/avatar/${address}?size=36`;
}

export function formatAddress(address: string) {
  return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
}
