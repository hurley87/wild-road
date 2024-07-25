'use client';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icons } from '../icons';
import { toast } from '../ui/use-toast';
import { getToken, getTextCodes, getImageCodes } from '@/lib/utils';
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
import { Textarea } from '../ui/textarea';
import { Id } from '@/convex/_generated/dataModel';
import { getCreatorClient } from '@/lib/creatorClient';
import { CHARACTER_COUNT_LIMIT, IRYS_URL } from '@/constants/common';
import { useContractAdmin } from '@/hooks/useContractAdmin';

function UpdateToken({ tokenId }: { tokenId: Id<'tokens'> }) {
  const token = useQuery(api.tokens.getTokenById, {
    tokenId,
  });
  const update = useMutation(api.tokens.updateToken);
  const { contractAdmin, walletClient } = useContractAdmin();
  const creatorClient = getCreatorClient();
  const [imageName, setImageName] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [openEditText, setOpenEditText] = useState(false);
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const [zoraUrl, setZoraUrl] = useState('');
  const collectionAddress = token?.collectionAddress;
  const uid = token?.uid;

  useEffect(() => {
    if (!token) return;
    setImageName(token.imageName);
    setImageDescription(token.imageDescription);
    setText(token.text);
    setZoraUrl(token.zoraUrl);
  }, [token]);

  const updateTextToken = async () => {
    setIsUpdatingToken(true);

    const { imageCode, metadataCode } = await getTextCodes(text);

    const tokenURI = `${IRYS_URL}${metadataCode}`;

    const token = await getToken(tokenURI, contractAdmin);

    const { signAndSubmit } = await creatorClient.updatePremint({
      collection: collectionAddress,
      uid,
      tokenConfigUpdates: {
        ...token,
      },
    });

    const client = (await walletClient) as any;

    await signAndSubmit({
      account: contractAdmin,
      walletClient: client,
      checkSignature: true,
    });

    await update({
      id: tokenId,
      text,
      imageCode,
      metadataCode,
      image: '',
      imageName: '',
      imageDescription: '',
    });

    toast({
      title: 'Your token has been updated:',
      description: text,
    });

    setText('');
    setIsUpdatingToken(false);
    setOpenEditText(false);
  };

  const updateImageToken = async () => {
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

    const { imageCode, metadataCode } = await getImageCodes(
      imageFile,
      imageName,
      imageDescription
    );

    const image = `${IRYS_URL}${imageCode}`;

    const tokenURI = `${IRYS_URL}${metadataCode}`;

    const token = await getToken(tokenURI, contractAdmin);

    const { signAndSubmit } = await creatorClient.updatePremint({
      collection: collectionAddress,
      uid,
      tokenConfigUpdates: {
        ...token,
      },
    });

    const client = (await walletClient) as any;

    await signAndSubmit({
      account: contractAdmin,
      walletClient: client,
      checkSignature: true,
    });

    await update({
      id: tokenId,
      text,
      imageCode,
      metadataCode,
      image,
      imageName,
      imageDescription,
    });

    toast({
      title: `Token's metadata updated`,
    });

    setOpenEditText(false);
    setIsUpdatingToken(false);
    setImageName('');
    setImageDescription('');
    setImageFile;
    setImageFile(null);
    setText('');
  };

  const updateZoraToken = async () => {
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
    const imageName = token.name;
    const imageDescription = token.description;

    await update({
      id: tokenId,
      text,
      imageCode: '',
      metadataCode: '',
      image,
      imageName,
      imageDescription,
      zoraUrl,
    });

    toast({
      title: `Token's metadata updated`,
    });

    setOpenEditText(false);
    setIsUpdatingToken(false);
    setImageName('');
    setImageDescription('');
    setImageFile;
    setImageFile(null);
    setText('');
    setZoraUrl('');
  };

  return (
    <Dialog open={openEditText} onOpenChange={setOpenEditText}>
      <DialogTrigger>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="border rounded-md p-1"
        >
          <Icons.pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Token Metadata</DialogTitle>
          <DialogDescription>
            {token?.zoraUrl ? (
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
                    disabled={
                      isUpdatingToken ||
                      zoraUrl.length === 0 ||
                      zoraUrl === token?.zoraUrl
                    }
                    onClick={updateZoraToken}
                  >
                    {isUpdatingToken ? 'Updating ...' : 'Update'}
                  </Button>
                </div>
              </div>
            ) : token?.image !== '' ? (
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
                  <Button disabled={isUpdatingToken} onClick={updateImageToken}>
                    {isUpdatingToken ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pt-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="picture">Text</Label>
                  <Textarea
                    className="w-full"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={10}
                  />
                  <p
                    className={`${text.length > CHARACTER_COUNT_LIMIT && 'text-red-500'} text-xs italic`}
                  >
                    {text.length}/{CHARACTER_COUNT_LIMIT}
                  </p>
                </div>
                <div>
                  <Button
                    disabled={
                      isUpdatingToken ||
                      text.length === 0 ||
                      text.length > CHARACTER_COUNT_LIMIT
                    }
                    onClick={updateTextToken}
                  >
                    {isUpdatingToken ? 'Updating ...' : 'Update'}
                  </Button>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateToken;
