import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { oauthProvider, providerDiscovery, providerIdentity, verifyProviderToken } from '@/lib/mcp/oauth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const safeEqual = (a: string, b: string) => Boolean(a && b && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b)));
function clearLinkCookies(response: NextResponse) {
  for (const name of ['fp_mcp_link_state', 'fp_mcp_link_nonce', 'fp_mcp_link_verifier']) {
    response.cookies.set(name, '', { path: '/api/profile/mcp-oauth', maxAge: 0 });
  }
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const redirect = (status: string) => clearLinkCookies(NextResponse.redirect(new URL('/profile/agent-access?oauth=' + status, origin)));
  const state = request.nextUrl.searchParams.get('state') || '';
  const savedState = request.cookies.get('fp_mcp_link_state')?.value || '';
  const nonce = request.cookies.get('fp_mcp_link_nonce')?.value || '';
  const verifier = request.cookies.get('fp_mcp_link_verifier')?.value || '';
  if (!safeEqual(state, savedState) || !nonce || !verifier || request.nextUrl.searchParams.has('error')) return redirect('failed');
  const user = await verifyToken(request);
  if (!user || user.role !== 'customer') return redirect('failed');
  const provider = oauthProvider();
  const code = request.nextUrl.searchParams.get('code');
  if (!provider || !code || code.length > 2048) return redirect('failed');
  try {
    const discovery = await providerDiscovery(provider);
    const response = await fetch(discovery.token_endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', code, redirect_uri: new URL('/api/profile/mcp-oauth/callback', origin).toString(),
        client_id: provider.clientId, client_secret: provider.clientSecret, code_verifier: verifier,
      }),
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return redirect('failed');
    const body = await response.json();
    if (typeof body.id_token !== 'string') return redirect('failed');
    const claims = await verifyProviderToken(body.id_token, provider.clientId);
    if (!claims.sub || claims.nonce !== nonce) return redirect('failed');
    const providerKey = providerIdentity(provider.issuer);
    const current = await prisma.oAuthIdentity.findUnique({
      where: { provider_providerAccountId: { provider: providerKey, providerAccountId: claims.sub } },
      select: { userId: true },
    });
    // Never permit the same provider account to be linked to another customer.
    if (current && current.userId !== user.userId) return redirect('conflict');
    await prisma.oAuthIdentity.upsert({
      where: { provider_providerAccountId: { provider: providerKey, providerAccountId: claims.sub } },
      update: {}, create: { userId: user.userId, provider: providerKey, providerAccountId: claims.sub },
    });
    return redirect('linked');
  } catch {
    return redirect('failed');
  }
}
