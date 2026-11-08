import { generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

const db = {
  oAuthIdentity: { findUnique: jest.fn() },
  product: { findMany: jest.fn(), findFirst: jest.fn() },
  category: { findMany: jest.fn() },
  subscriptionPlan: { findMany: jest.fn() },
  bag: { create: jest.fn() },
};
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: db }));

import { authenticateOAuthAgent } from '@/lib/mcp/oauth';
import { GET as resourceMetadata } from '@/app/.well-known/oauth-protected-resource/route';
import { POST as mcpPost } from '@/app/api/mcp/route';

const issuer = 'https://identity.example.test/';
const audience = 'https://freshpick.lk/api/mcp';
let seq = 1;
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'oauth-key-1', use: 'sig', alg: 'RS256' };
let fetchSpy: jest.SpyInstance;

beforeAll(() => {
  process.env.MCP_OAUTH_ISSUER = issuer;
  process.env.MCP_OAUTH_RESOURCE = audience;
  process.env.MCP_OAUTH_LINK_CLIENT_ID = 'link-client';
  process.env.MCP_OAUTH_LINK_CLIENT_SECRET = 'not-a-real-secret';
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    const body = url.endsWith('/.well-known/openid-configuration') ? {
      issuer, authorization_endpoint: issuer + 'authorize',
      token_endpoint: issuer + 'oauth/token', jwks_uri: issuer + '.well-known/jwks.json',
    } : { keys: [jwk] };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
});
afterAll(() => {
  fetchSpy.mockRestore();
  delete process.env.MCP_OAUTH_ISSUER;
  delete process.env.MCP_OAUTH_RESOURCE;
  delete process.env.MCP_OAUTH_LINK_CLIENT_ID;
  delete process.env.MCP_OAUTH_LINK_CLIENT_SECRET;
});
beforeEach(() => {
  jest.clearAllMocks();
  db.oAuthIdentity.findUnique.mockResolvedValue({
    userId: 'customer-1', user: { isBanned: false, role: 'customer' },
  });
});
function sign(scope: string, tokenAudience: string = audience) {
  return jwt.sign({ scope }, privateKey, {
    algorithm: 'RS256', keyid: 'oauth-key-1', issuer,
    audience: tokenAudience, subject: 'provider-user-1', expiresIn: '10m',
  });
}
async function rpc(method: string, params: Record<string, unknown> = {}) {
  const response = await mcpPost(new Request(audience, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: seq++, method, params }),
  }) as NextRequest);
  return response.json();
}

it('publishes correct resource metadata without leaking OAuth client secrets', async () => {
  const response = await resourceMetadata();
  const json = await response.json();
  expect(response.status).toBe(200);
  expect(json.resource).toBe(audience);
  expect(json.authorization_servers).toEqual([issuer]);
  expect(json.scopes_supported).toContain('bags:write');
  expect(JSON.stringify(json)).not.toContain('not-a-real-secret');
});

it('advertises customer tools to an anonymous OAuth client but challenges their use', async () => {
  const listed = await rpc('tools/list');
  const bag = listed.result.tools.find((t: { name: string }) => t.name === 'create_bag');
  expect(bag._meta.securitySchemes).toEqual([{ type: 'oauth2', scopes: ['bags:write'] }]);
  const called = await rpc('tools/call', { name: 'create_bag', arguments: { name: 'Groceries' } });
  expect(called.result.isError).toBe(true);
  expect(called.result._meta['mcp/www_authenticate'][0]).toContain('resource_metadata=');
  expect(db.bag.create).not.toHaveBeenCalled();
});

it('rejects broken OAuth settings without breaking anonymous catalog discovery', async () => {
  const saved = process.env.MCP_OAUTH_ISSUER;
  process.env.MCP_OAUTH_ISSUER = 'http://invalid-issuer.example.test';
  try {
    const metadata = await resourceMetadata();
    expect(metadata.status).toBe(503);
    expect(await metadata.json()).toMatchObject({ code: 'OAUTH_CONFIGURATION_INVALID' });
    const listed = await rpc('tools/list');
    expect(listed.result.tools.map((t: { name: string }) => t.name)).toEqual(
      expect.arrayContaining(['search_products', 'list_subscription_plans']),
    );
    expect(listed.result.tools.map((t: { name: string }) => t.name)).not.toContain('create_bag');
  } finally {
    if (saved === undefined) delete process.env.MCP_OAUTH_ISSUER;
    else process.env.MCP_OAUTH_ISSUER = saved;
  }
});

it('verifies OAuth signature, issuer, audience, scope and linked customer identity', async () => {
  const result = await authenticateOAuthAgent(sign('bags:read bags:write'));
  expect(result).toEqual({ userId: 'customer-1', scopes: ['bags:read', 'bags:write'] });
  expect(db.oAuthIdentity.findUnique).toHaveBeenCalledWith(expect.objectContaining({
    where: { provider_providerAccountId: expect.objectContaining({ providerAccountId: 'provider-user-1' }) },
  }));
  expect(await authenticateOAuthAgent(sign('bags:write', 'https://other.example.test'))).toBeNull();
  expect(await authenticateOAuthAgent(sign('unapproved:scope'))).toBeNull();
});
