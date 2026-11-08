import 'server-only';
import { createHash, createPublicKey, type JsonWebKey as NodeJsonWebKey } from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const MCP_SCOPES = [
  'catalog:read', 'bags:read', 'bags:write',
  'wishlist:read', 'wishlist:write', 'orders:read',
] as const;

type Discovery = {
  issuer: string; authorization_endpoint: string; token_endpoint: string; jwks_uri: string;
};
type ProviderConfig = { issuer: string; resource: string; clientId: string; clientSecret: string };

function httpsUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw new Error('MCP OAuth requires an HTTPS URL.');
  return url;
}

export function oauthProvider(): ProviderConfig | null {
  const { MCP_OAUTH_ISSUER, MCP_OAUTH_LINK_CLIENT_ID, MCP_OAUTH_LINK_CLIENT_SECRET, MCP_OAUTH_RESOURCE } = process.env;
  if (!MCP_OAUTH_ISSUER || !MCP_OAUTH_LINK_CLIENT_ID || !MCP_OAUTH_LINK_CLIENT_SECRET || !MCP_OAUTH_RESOURCE) return null;
  const issuer = httpsUrl(MCP_OAUTH_ISSUER).toString();
  const resource = httpsUrl(MCP_OAUTH_RESOURCE).toString();
  return { issuer, resource, clientId: MCP_OAUTH_LINK_CLIENT_ID, clientSecret: MCP_OAUTH_LINK_CLIENT_SECRET };
}

export function oauthMetadataUrl(provider: ProviderConfig) {
  return new URL('/.well-known/oauth-protected-resource', provider.resource).toString();
}

export function oauthChallenge(provider: ProviderConfig, scope: string, description = 'Connect your FreshPick account to continue.') {
  return 'Bearer resource_metadata="' + oauthMetadataUrl(provider) +
    '", scope="' + scope + '", error="insufficient_scope", error_description="' + description + '"';
}

let discoveryCache: { issuer: string; expires: number; value: Discovery } | undefined;
export async function providerDiscovery(provider: ProviderConfig): Promise<Discovery> {
  if (discoveryCache?.issuer === provider.issuer && discoveryCache.expires > Date.now()) return discoveryCache.value;
  const discoveryUrl = new URL('.well-known/openid-configuration', provider.issuer);
  const response = await fetch(discoveryUrl, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('OAuth provider discovery unavailable.');
  const data: Discovery = await response.json();
  if (data.issuer !== provider.issuer) throw new Error('OAuth provider issuer mismatch.');
  for (const key of ['authorization_endpoint', 'token_endpoint', 'jwks_uri'] as const) {
    const endpoint = httpsUrl(data[key]);
    // Do not follow untrusted endpoints to another origin.
    if (endpoint.origin !== new URL(provider.issuer).origin) throw new Error('Untrusted OAuth endpoint origin.');
  }
  discoveryCache = { issuer: provider.issuer, expires: Date.now() + 5 * 60_000, value: data };
  return data;
}

let jwksCache: { url: string; expires: number; keys: Array<{ kty: string; kid?: string; alg?: string; use?: string }> } | undefined;
async function providerKey(discovery: Discovery, token: string) {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || decoded.header.alg !== 'RS256' || !decoded.header.kid) {
    throw new Error('Unsupported OAuth access token.');
  }
  if (jwksCache?.url !== discovery.jwks_uri || jwksCache.expires <= Date.now()) {
    const response = await fetch(discovery.jwks_uri, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('OAuth signing keys unavailable.');
    const data = await response.json();
    if (!Array.isArray(data.keys) || data.keys.length > 30) throw new Error('Invalid OAuth signing keys.');
    jwksCache = { url: discovery.jwks_uri, expires: Date.now() + 5 * 60_000, keys: data.keys };
  }
  const key = jwksCache.keys.find(k => k.kid === decoded.header.kid && k.kty === 'RSA' && (k.alg == null || k.alg === 'RS256') && (k.use == null || k.use === 'sig'));
  if (!key) throw new Error('Unknown OAuth signing key.');
  return createPublicKey({ key: key as NodeJsonWebKey, format: 'jwk' });
}

export async function verifyProviderToken(token: string, audience: string): Promise<JwtPayload> {
  const provider = oauthProvider();
  if (!provider) throw new Error('OAuth is not configured.');
  const discovery = await providerDiscovery(provider);
  const key = await providerKey(discovery, token);
  const claims = jwt.verify(token, key, { algorithms: ['RS256'], issuer: provider.issuer, audience, clockTolerance: 30 });
  if (typeof claims === 'string' || !claims.sub || !claims.exp) throw new Error('Invalid OAuth token claims.');
  return claims;
}

export function providerIdentity(issuer: string) {
  return 'mcp:' + createHash('sha256').update(issuer).digest('hex');
}

export async function authenticateOAuthAgent(token: string): Promise<{ userId: string; scopes: string[] } | null> {
  const provider = oauthProvider();
  if (!provider) return null;
  try {
    const claims = await verifyProviderToken(token, provider.resource);
    const scopes = typeof claims.scope === 'string' ? claims.scope.split(/\s+/) : [];
    if (!scopes.some(scope => MCP_SCOPES.includes(scope as typeof MCP_SCOPES[number]))) return null;
    const identity = await prisma.oAuthIdentity.findUnique({
      where: { provider_providerAccountId: { provider: providerIdentity(provider.issuer), providerAccountId: claims.sub! } },
      select: { userId: true, user: { select: { isBanned: true, role: true } } },
    });
    if (!identity || identity.user.isBanned || identity.user.role !== 'customer') return null;
    return { userId: identity.userId, scopes };
  } catch {
    return null;
  }
}
