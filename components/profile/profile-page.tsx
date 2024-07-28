'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileIdeas } from './profile-ideas';
import { ProfileCollections } from './profile-collections';
import { Avatar, AvatarImage } from '../ui/avatar';
import { formatAddress, getAvatarUrl } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';

export default function ProfilePage({
  walletAddress,
}: {
  walletAddress: `0x${string}`;
}) {
  const { user } = usePrivy();
  const farcaster = user?.farcaster;
  const username = formatAddress(walletAddress);
  const avatarImg = getAvatarUrl(walletAddress);
  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-6 pb-10">
      <div className="flex gap-1 items-center">
        <Avatar className="h-6 w-6">
          <AvatarImage
            alt="Picture"
            src={farcaster ? (farcaster.pfp as string) : avatarImg}
          />
        </Avatar>
        <div className="text-sm text-muted-foreground">
          {farcaster ? farcaster.username : username}
        </div>
      </div>
      <Tabs defaultValue="ideas" className="w-full">
        <TabsList>
          <TabsTrigger value="ideas">Curations</TabsTrigger>
          <TabsTrigger value="collections">Creations</TabsTrigger>
        </TabsList>
        <TabsContent value="ideas">
          <ProfileIdeas walletAddress={walletAddress} />
        </TabsContent>
        <TabsContent value="collections">
          <ProfileCollections walletAddress={walletAddress} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
