import ProfilePage from '@/components/profile/profile-page';

interface ProfilePageProps {
  params: { walletAddress: `0x${string}` };
}

export default async function Collect({ params }: ProfilePageProps) {
  const walletAddress = params.walletAddress as `0x${string}`;
  return <ProfilePage walletAddress={walletAddress} />;
}
