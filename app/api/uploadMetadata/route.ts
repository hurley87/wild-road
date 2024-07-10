import Irys from '@irys/sdk';
import { NextRequest, NextResponse } from 'next/server';

const getIrys = async () => {
  const key = process.env.PRIVATE_KEY;
  const token = process.env.NEXT_PUBLIC_TOKEN || '';
  const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
  const providerUrl = process.env.NEXT_PUBLIC_RPC_URL;

  const irys = new Irys({
    network,
    token,
    key,
    config: { providerUrl },
  });

  return irys;
};

export async function POST(req: NextRequest): Promise<Response> {
  const data = await req.json();

  const irys = await getIrys();

  const receipt = await irys.upload(JSON.stringify(data));

  const receiptId = receipt.id;

  return NextResponse.json({ receiptId });
}

export const dynamic = 'force-dynamic';
