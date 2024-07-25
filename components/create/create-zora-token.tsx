'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from '../ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { useContractAdmin } from '@/hooks/useContractAdmin';
import { Id } from '@/convex/_generated/dataModel';
import { Input } from '../ui/input';

function CreateZoraToken({ id }: { id: Id<'collections'> }) {
  const { contractAdmin } = useContractAdmin();
  const createToken = useMutation(api.tokens.create);
  const [zoraUrl, setZoraUrl] = useState('');
  const [openCreateText, setOpenCreateText] = useState(false);
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const addTextToken = async () => {
    setIsUpdatingToken(true);

    if (!zoraUrl.includes('base:')) {
      toast({
        title: 'Please enter a valid Zora URL',
        variant: 'destructive',
      });
      return;
    }
    const collectionAddress = zoraUrl.split('base:')[1].split('/')[0];
    const uid = parseInt(zoraUrl.split('/')[zoraUrl.split('/').length - 1]);

    const response = await fetch('/api/tokenData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionAddress, uid }),
    });

    const { token } = await response.json();

    const image = token.image_url;
    const imageName = token.name || '';
    const imageDescription = token.description || '';

    try {
      await createToken({
        uid,
        text: '',
        collectionId: id,
        collectionAddress,
        contractAdmin,
        metadataCode: '',
        imageCode: '',
        image,
        imageDescription,
        imageName,
        zoraUrl,
      });

      toast({
        title: `Created token #${uid}`,
        description: imageName,
      });
    } catch {
      toast({
        title: 'Error adding token',
        variant: 'destructive',
      });
    }

    setZoraUrl('');
    setIsUpdatingToken(false);
    setOpenCreateText(false);
  };

  return (
    <Dialog open={openCreateText} onOpenChange={setOpenCreateText}>
      <DialogTrigger>
        <Button type="button" size="icon" variant="outline">
          <img src="/Zorb.png" alt="Zora" className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Zora Token</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-6 pt-6">
              <div className="grid w-full items-center gap-1.5">
                <Label>Zora URL</Label>
                <Input
                  value={zoraUrl}
                  onChange={(e) => setZoraUrl(e.target.value)}
                />
                <p className="italic text-xs">
                  e.g.
                  https://zora.co/collect/base:0x1491ea485e78cdbe895293cbaeb2b707012197b9/6
                </p>
              </div>
              <div>
                <Button
                  disabled={isUpdatingToken || zoraUrl.length === 0}
                  onClick={addTextToken}
                >
                  {isUpdatingToken ? 'Adding ...' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CreateZoraToken;
