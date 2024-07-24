import EditCollection from '@/components/create/edit-collection';

interface EditCollectionProps {
  params: { collectionAddress: string };
}

export default async function Collect({ params }: EditCollectionProps) {
  const collectionAddress = params.collectionAddress as `0x${string}`;
  return <EditCollection collectionAddress={collectionAddress} />;
}
