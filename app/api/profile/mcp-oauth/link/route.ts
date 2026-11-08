import { createHash, randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { oauthProvider, providerDiscovery } from '@/lib/mcp/oauth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user || user.role !== 'customer') return NextResponse.redirect(new URL('/auth/login?redirect=/profile/agent-access', request.url));
  const provider = oauthProvider();
  if (!provider) return NextResponse.json({ error: 'ChatGPT account linking is not configured.' }, { status: 503 });
  try {
    const discovery = await providerDiscovery(provider);
    const state = randomBytes(32).toString('hex');
    const nonce = randomBytes(32).toString('hex');
    const verifier = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const callbackUrl = new URL('/api/profile/mcp-oauth/callback', request.url).toString();
    const authorize = new URL(discovery.authorization_endpoint);
    authorize.searchParams.set('response_type', 'code');
    authorize.searchParams.set('client_id', provider.clientId);
    authorize.searchParams.set('redirect_uri', callbackUrl);
    authorize.searchParams.set('scope', 'openid profile');
    authorize.searchParams.set('state', state);
    authorize.searchParams.set('nonce', nonce);
    authorize.searchParams.set('code_challenge', challenge);
    authorize.searchParams.set('code_challenge_method', 'S256');
    const response = NextResponse.redirect(authorize);
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/profile/mcp-oauth', maxAge: 600 };
    response.cookies.set('fp_mcp_link_state', state, options);
    response.cookies.set('fp_mcp_link_nonce', nonce, options);
    response.cookies.set('fp_mcp_link_verifier', verifier, options);
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not start the secure account-linking flow.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
