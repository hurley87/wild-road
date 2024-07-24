import {
  FrameButtonMetadata,
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from '@coinbase/onchainkit/frame';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL, IRYS_URL } from '@/constants/common';

const getAllowFramegear = () => process.env.NODE_ENV !== 'production';

const getUid = (isNextButton: boolean, currentUid: number) =>
  isNextButton ? currentUid + 1 : currentUid - 1;

const getButtons = (
  uid: number,
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
        action: 'link',
        label: 'Mint',
        target: url + `?uid=1`,
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
      action: 'link',
      label: 'Mint',
      target: url + `?uid=${uid}`,
    },
  ];
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const neynarApiKey = 'NEYNAR_ONCHAIN_KIT';
  const allowFramegear = getAllowFramegear();
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey,
    allowFramegear,
  });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  const button = message.button;
  const isNextButton = button === 2;
  const collectionAddress = req.nextUrl.searchParams.get(
    'collectionAddress'
  ) as string;
  let state = {
    uid: 1,
  };
  try {
    state = JSON.parse(decodeURIComponent(message.state?.serialized));
  } catch {}

  let uid = getUid(isNextButton, state.uid);

  let token = await fetchQuery(api.tokens.getToken, { collectionAddress, uid });

  if (!token) {
    token = await fetchQuery(api.tokens.getToken, {
      collectionAddress,
      uid: 1,
    });
    uid = 1;
  }

  const src = `${IRYS_URL}${token.imageCode}`;
  const url = `${BASE_URL}/collect/${collectionAddress}`;
  const buttons = getButtons(uid, url);

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
