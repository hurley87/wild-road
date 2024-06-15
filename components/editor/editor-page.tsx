'use client';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';

export default function EditorPage({
  collectionId,
}: {
  collectionId: Id<'collections'>;
}) {
  const collection = useQuery(api.collections.getCollection, {
    collectionId,
  });

  console.log('collection', collection);

  return <div>{collectionId}</div>;
}
