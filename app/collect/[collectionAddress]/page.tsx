import CollectPage from '@/components/collect/collect-page';

interface CollectPageProps {
  params: { collectionAddress: string };
}

export default async function Collect({ params }: CollectPageProps) {
  const collectionAddress = params.collectionAddress as string;
  return <CollectPage collectionAddress={collectionAddress} />;
}
