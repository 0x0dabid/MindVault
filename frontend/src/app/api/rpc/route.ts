import { NextRequest, NextResponse } from 'next/server';

const RITUAL_RPC = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://rpc.ritualfoundation.org';

// Proxy JSON-RPC calls to Ritual Chain, bypassing browser CORS restrictions.
// The frontend wagmi transport should point to /api/rpc when a public RPC is unreachable.
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const upstream = await fetch(RITUAL_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const data = await upstream.text();
    return new NextResponse(data, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32603, message: err?.message ?? 'Proxy error' }, id: null }, { status: 502 });
  }
}
