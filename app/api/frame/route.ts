import {
  FrameButtonMetadata,
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from '@coinbase/onchainkit/frame';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const getAllowFramegear = () => process.env.NODE_ENV !== 'production';

const getUid = (isNextButton: boolean, currentUid: number) =>
  isNextButton ? currentUid + 1 : currentUid - 1;

const getButtons = (
  uid: number,
  target: string,
  url: string
): [FrameButtonMetadata, ...FrameButtonMetadata[]] => {
  if (uid === 1) {
    return [
      {
        action: 'link',
        label: 'Read Online',
        target: url,
      },
      {
        label: 'Read Inline',
      },
      {
        action: 'mint',
        label: 'Mint',
        target,
      },
    ];
  }
  return [
    {
      label: 'Previous',
    },
    {
      label: 'Next',
    },
    {
      action: 'mint',
      label: 'Mint',
      target,
    },
  ];
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const neynarApiKey = 'NEYNAR_ONCHAIN_KIT';
  console.log('neynarApiKey: ', neynarApiKey);
  const allowFramegear = getAllowFramegear();
  console.log('allowFramegear: ', allowFramegear);
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey,
    allowFramegear,
  });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  const button = message.button;

  console.log('button: ', button);
  const isNextButton = button === 2;
  const collectionAddress = req.nextUrl.searchParams.get(
    'collectionAddress'
  ) as string;
  const state = JSON.parse(decodeURIComponent(message.state?.serialized));

  console.log('state: ', state);
  let uid = getUid(isNextButton, state.uid);

  let token = await fetchQuery(api.tokens.getToken, { collectionAddress, uid });

  if (!token) {
    token = await fetchQuery(api.tokens.getToken, {
      collectionAddress,
      uid: 1,
    });
    uid = 1;
  }

  console.log('token: ', token?.tokenURI);

  const src = await getImage(token?.tokenURI);
  const url = `${BASE_URL}/collect/${collectionAddress}`;
  const target = `eip155:8453:${collectionAddress}:${uid}`;
  const buttons = getButtons(uid, target, url);

  return new NextResponse(
    getFrameHtmlResponse({
      buttons,
      image: {
        src,
        aspectRatio: '1:1',
      },
      postUrl: `${BASE_URL}/api/frame?collectionAddress=${collectionAddress}`,
      state: {
        uid,
      },
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
