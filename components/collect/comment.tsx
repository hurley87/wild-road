'use client';
import { getAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarImage } from '../ui/avatar';
import { formatAddress } from '@/lib/utils';

export function Comment({ mint }: { mint: any }) {
  const address = mint.minterAccount;
  const avatarImg = getAvatarUrl(address);
  const username = formatAddress(address);

  return (
    <div className="flex items-center gap-1 text-xs">
      <Avatar className="h-4 w-4">
        <AvatarImage alt="Picture" src={avatarImg} />
      </Avatar>
      <div className="font-semibold">{username}:</div>
      <div>{mint.mintComment}</div>
    </div>
  );
}
