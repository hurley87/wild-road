import CreateCollection from '@/components/create/create-collection';

export async function generateMetadata() {
  return {
    title: 'IEDO Network',
    description: 'Mint your ideas',
  };
}

export default async function CreatePage() {
  return <CreateCollection />;
}
