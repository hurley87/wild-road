'use client';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { Button } from './ui/button';
import { Icons } from './icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from './ui/avatar';
import { formatAddress } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/utils';

export default function Header() {
  const { login, user, logout } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const farcaster = user?.farcaster;
  const username = formatAddress(address);
  const avatarImg = getAvatarUrl(address);

  return (
    <div className="w-full flex justify-between py-3 px-6 items-center">
      <Link href="/">
        <Icons.lightbulb />
      </Link>
      {user?.wallet ? (
        <div className="flex gap-2">
          <Link href="/create" className="bg-button p-2 rounded-2xl">
            <Icons.add />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-6 w-6">
                <AvatarImage
                  alt="Picture"
                  src={farcaster ? (farcaster.pfp as string) : avatarImg}
                />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none font-semibold">
                  {farcaster ? (
                    <Link
                      target="_blank"
                      href={`https://warpcast.com/${farcaster.username}`}
                    >
                      {farcaster.username}
                    </Link>
                  ) : (
                    <Link target="_blank" href={`https://zora.co/${address}`}>
                      {username}
                    </Link>
                  )}
                </div>
              </div>
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/posts">Posts</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/collection">Collection</Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onSelect={logout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button onClick={login}>Login</Button>
      )}
    </div>
  );
}
