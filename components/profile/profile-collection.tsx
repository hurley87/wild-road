'use client';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from '../ui/use-toast';
import { Icons } from '../icons';

export function ProfileCollection({ id }: { id: Id<'collections'> }) {
  const collection = useQuery(api.collections.getCollectionById, {
    id,
  });
  const deleteCollection = useMutation(api.collections.deleteCollection);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!collection) return null;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      setIsDeleting(true);
      await deleteCollection({
        id,
      });
      toast({
        description: 'Your collection has been deleted',
      });
      setIsDeleting(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete.',
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="border rounded-md p-1"
        onClick={handleDelete}
      >
        {isDeleting ? (
          <Icons.spinner className="h-4 w-4 animate-spin" />
        ) : (
          <Icons.trash className="w-4 h-4" />
        )}
      </Button>
      <Link
        href={`/create/${collection.collectionAddress}`}
        className="underline text-2xl font-bold"
        key={id}
      >
        {collection.contractName}
      </Link>
    </div>
  );
}
