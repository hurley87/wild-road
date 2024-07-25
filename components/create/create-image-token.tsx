'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icons } from '../icons';
import { toast } from '../ui/use-toast';
import { getToken, getImageCodes } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import createPremint from '@/lib/premint';
import { IRYS_URL } from '@/constants/common';
import { useContractAdmin } from '@/hooks/useContractAdmin';
import { Id } from '@/convex/_generated/dataModel';

function CreateImageToken({ id }: { id: Id<'collections'> }) {
  const collection = useQuery(api.collections.getCollectionById, {
    id,
  });
  const { contractAdmin, walletClient } = useContractAdmin();
  const createToken = useMutation(api.tokens.create);
  const [imageName, setImageName] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [openCreateImage, setOpenCreateImage] = useState(false);
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const contractName = collection?.contractName;
  const contractURI = collection?.contractURI;

  const addImageToken = async () => {
    setIsUpdatingToken(true);

    if (!imageFile) {
      toast({
        title: 'Please select an image',
        variant: 'destructive',
      });
      return;
    }

    if (imageName.length < 1) {
      toast({
        title: 'Please add a name',
        variant: 'destructive',
      });
      return;
    }

    if (imageDescription.length < 1) {
      toast({
        title: 'Please add a description',
        variant: 'destructive',
      });
      return;
    }

    const contract = {
      contractAdmin,
      contractName,
      contractURI,
    };

    const { imageCode, metadataCode } = await getImageCodes(
      imageFile,
      imageName,
      imageDescription
    );

    const image = `${IRYS_URL}${imageCode}`;

    const tokenURI = `${IRYS_URL}${metadataCode}`;

    const tokenToSave = await getToken(tokenURI, contractAdmin);

    const { uid, collectionAddress } = await createPremint(
      contract,
      tokenToSave,
      contractAdmin,
      walletClient
    );

    await createToken({
      uid,
      text: '',
      collectionId: id,
      collectionAddress,
      contractAdmin,
      metadataCode,
      imageCode,
      image,
      imageDescription,
      imageName,
    });

    toast({
      title: `Created token #${uid}`,
      description: imageName,
    });

    setOpenCreateImage(false);
    setIsUpdatingToken(false);
    setImageName('');
    setImageDescription('');
    setImageFile(null);
  };

  return (
    <Dialog open={openCreateImage} onOpenChange={setOpenCreateImage}>
      <DialogTrigger>
        <Button type="button" size="icon" variant="outline">
          <Icons.media className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Image Token</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-6 pt-6">
              <div className="grid w-full items-center gap-1.5">
                <Label>Name</Label>
                <Input
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label>Description</Label>
                <Input
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">File</Label>
                <Input
                  onChange={(e) => {
                    if (e.target.files) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  id="picture"
                  type="file"
                />
                <p className="text-xs italic">1:1 ratio is recommended</p>
              </div>
              <div>
                <Button disabled={isUpdatingToken} onClick={addImageToken}>
                  {isUpdatingToken ? 'Creating ...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CreateImageToken;
