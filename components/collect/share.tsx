'use client';
import { Button } from '../ui/button';
import { Icons } from '../icons';
import { toast } from '../ui/use-toast';

export default function Share({
  collectionAddress,
}: {
  collectionAddress: `0x${string}`;
}) {
  const handleCopyLink = async () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/collect/${collectionAddress}`
    );
    toast({
      title: 'Link copied',
    });
  };

  return (
    <Button
      onClick={handleCopyLink}
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
    >
      <Icons.share className="w-4 h-4" />
    </Button>
  );
}
