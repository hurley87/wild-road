import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  const { collectionAddress, uid } = await req.json();

  try {
    const response = await fetch(
      `https://api.simplehash.com/api/v0/nfts/base/${collectionAddress}/${uid}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': process.env.SIMPLE_HASH_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    const token = await response.json();

    return NextResponse.json({ token });
  } catch (e) {
    return NextResponse.json({ e });
  }
}
