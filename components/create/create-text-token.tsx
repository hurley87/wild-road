'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icons } from '../icons';
import { toast } from '../ui/use-toast';
import { getToken, getTextCodes } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import createPremint from '@/lib/premint';
import { CHARACTER_COUNT_LIMIT, IRYS_URL } from '@/constants/common';
import { useContractAdmin } from '@/hooks/useContractAdmin';

function CreateTextToken({
  contractName,
  contractURI,
}: {
  contractName: string;
  contractURI: string;
}) {
  const { contractAdmin, walletClient } = useContractAdmin();
  const createToken = useMutation(api.tokens.create);
  const [text, setText] = useState('');
  const [openCreateText, setOpenCreateText] = useState(false);
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);

  const addTextToken = async () => {
    setIsUpdatingToken(true);

    const contract = {
      contractAdmin,
      contractName,
      contractURI,
    };

    const { imageCode, metadataCode } = await getTextCodes(text);

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
      text,
      collectionAddress,
      contractAdmin,
      metadataCode,
      imageCode,
      image: '',
      imageDescription: '',
      imageName: '',
    });

    toast({
      title: `Created token #${uid}`,
      description: text,
    });

    setText('');
    setIsUpdatingToken(false);
    setOpenCreateText(false);
  };

  return (
    <Dialog open={openCreateText} onOpenChange={setOpenCreateText}>
      <DialogTrigger>
        <Button type="button" size="icon">
          <Icons.text className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Text Token</DialogTitle>
          <DialogDescription>
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
                  onClick={addTextToken}
                >
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

export default CreateTextToken;
