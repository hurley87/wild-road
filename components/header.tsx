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
  const address = user?.wallet?.address;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 border-button border-b bg-white h-16">
      <div className="w-full flex justify-between py-3 px-6">
        <Link href="/" className="hidden items-center space-x-2 md:flex">
          <Icons.lightbulb />
          <span className="hidden font-bold sm:inline-block">Wild Road</span>
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
                    src={`https://zora.co/api/avatar/${address}?size=36`}
                  />
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {address?.slice(0, 4)}...{address?.slice(-4)}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/posts">Posts</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collection">Collection</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
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
    </div>
  );
}
