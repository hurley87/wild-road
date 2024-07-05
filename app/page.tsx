import CollectPage from '@/components/collect/collect-page';

export default function Home() {
  return (
    <CollectPage
      collectionAddress={process.env.HOMEPAGE_COLLECTION as `0x${string}`}
    />
  );
}
