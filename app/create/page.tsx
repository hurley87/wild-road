import CreatePost from '@/components/create/create-post';

export async function generateMetadata() {
  return {
    title: 'Wild',
    description: 'Share your ideas',
  };
}

export default async function CreatePage() {
  return <CreatePost />;
}
