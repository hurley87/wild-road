import EditorPage from '@/components/editor/editor-page';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { notFound } from 'next/navigation';

interface EditorPageProps {
  params: { collectionId: string };
}

export default async function Editor({ params }: EditorPageProps) {
  const collectionId = params.collectionId as Id<'collections'>;
  console.log('collectionId', collectionId);
  return <EditorPage collectionId={collectionId} />;
}
