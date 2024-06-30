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

export default function Header() {
  const { login, user, logout } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const farcaster = user?.farcaster;

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
                  src={
                    farcaster
                      ? (farcaster.pfp as string)
                      : `https://zora.co/api/avatar/${address}?size=36`
                  }
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
                      {address?.slice(0, 4)}...{address?.slice(-4)}
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
