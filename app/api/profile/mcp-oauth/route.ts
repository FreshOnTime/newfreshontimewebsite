import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { oauthProvider, providerIdentity } from '@/lib/mcp/oauth';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers });
  const provider = oauthProvider();
  if (!provider) return NextResponse.json({ configured: false, linked: false }, { headers });
  const count = await prisma.oAuthIdentity.count({ where: { userId: user.userId, provider: providerIdentity(provider.issuer) } });
  return NextResponse.json({ configured: true, linked: count > 0 }, { headers });
}

export async function DELETE(request: NextRequest) {
  const hasCookie = Boolean(request.cookies?.get('accessToken')?.value)
    || /(?:^|;\s*)accessToken=[^;]+/.test(request.headers.get('cookie') || '');
  if (!hasCookie || request.headers.get('origin') !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Use the FreshPick website to disconnect.' }, { status: 403, headers });
  }
  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers });
  const provider = oauthProvider();
  if (!provider) return NextResponse.json({ error: 'OAuth is not configured' }, { status: 503, headers });
  const deleted = await prisma.oAuthIdentity.deleteMany({ where: { userId: user.userId, provider: providerIdentity(provider.issuer) } });
  return NextResponse.json({ disconnected: true, count: deleted.count }, { headers });
}
