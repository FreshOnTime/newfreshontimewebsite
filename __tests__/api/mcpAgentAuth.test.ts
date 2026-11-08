import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';

const db = {
  agentAccessToken: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
};
const verify = jest.fn();
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: db }));
jest.mock('@/lib/auth', () => ({ verifyToken: (...args: unknown[]) => verify(...args) }));

import { authenticateMcpAgent } from '@/lib/mcp/agentAuth';
import { POST, DELETE, GET } from '@/app/api/profile/agent-tokens/route';

const secret = 'fp_agent_' + 'b'.repeat(64);
function browser(method: string, body?: unknown, origin = 'https://freshpick.lk') {
  return new NextRequest('https://freshpick.lk/api/profile/agent-tokens', {
    method, headers: { Cookie: 'accessToken=browser-secret', Origin: origin, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  verify.mockResolvedValue({ userId: 'customer-a', isBanned: false });
  db.agentAccessToken.count.mockResolvedValue(0);
  db.agentAccessToken.create.mockImplementation(async ({ data }: { data: { name: string; tokenHash: string; expiresAt: Date } }) => ({
    id: 'token-id', name: data.name, expiresAt: data.expiresAt, createdAt: new Date(),
  }));
  db.agentAccessToken.findMany.mockResolvedValue([{ id: 'token-id', name: 'Groceries', expiresAt: new Date(), createdAt: new Date() }]);
  db.agentAccessToken.deleteMany.mockResolvedValue({ count: 1 });
});

it('does not let a customer login cookie authenticate a remote MCP agent', async () => {
  expect(await authenticateMcpAgent(new Request('https://freshpick.lk/api/mcp', { headers: { Cookie: 'accessToken=browser-secret' } }))).toBeNull();
  expect(db.agentAccessToken.findUnique).not.toHaveBeenCalled();
});

it('authenticates only a hashed, unexpired token belonging to a non-banned user', async () => {
  db.agentAccessToken.findUnique.mockResolvedValue({ userId: 'customer-a', expiresAt: new Date(Date.now() + 60000), user: { isBanned: false } });
  expect(await authenticateMcpAgent(new Request('https://freshpick.lk/api/mcp', { headers: { Authorization: 'Bearer ' + secret } }))).toEqual({ userId: 'customer-a' });
  expect(db.agentAccessToken.findUnique).toHaveBeenCalledWith(expect.objectContaining({
    where: { tokenHash: createHash('sha256').update(secret).digest('hex') },
  }));
  db.agentAccessToken.findUnique.mockResolvedValueOnce({ userId: 'customer-a', expiresAt: new Date(Date.now() - 60000), user: { isBanned: false } });
  expect(await authenticateMcpAgent(new Request('https://freshpick.lk/api/mcp', { headers: { Authorization: 'Bearer ' + secret } }))).toBeNull();
  db.agentAccessToken.findUnique.mockResolvedValueOnce({ userId: 'customer-a', expiresAt: new Date(Date.now() + 60000), user: { isBanned: true } });
  expect(await authenticateMcpAgent(new Request('https://freshpick.lk/api/mcp', { headers: { Authorization: 'Bearer ' + secret } }))).toBeNull();
});

it('blocks cross-origin creation even when the browser has an authentication cookie', async () => {
  expect((await POST(browser('POST', { name: 'Grocery assistant' }, 'https://attacker.example'))).status).toBe(403);
  expect(db.agentAccessToken.create).not.toHaveBeenCalled();
});

it('issues a one-time plaintext token but persists only the hash', async () => {
  const response = await POST(browser('POST', { name: 'Grocery assistant' }));
  const body = await response.json();
  expect(response.status).toBe(201);
  expect(body.token).toMatch(/^fp_agent_[a-f0-9]{64}$/);
  expect(db.agentAccessToken.create.mock.calls[0][0].data.tokenHash).toBe(createHash('sha256').update(body.token).digest('hex'));
  expect(JSON.stringify(db.agentAccessToken.create.mock.calls[0][0])).not.toContain(body.token);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
});

it('never lists a stored secret and revokes only this customer’s token', async () => {
  const list = await (await GET(browser('GET'))).json();
  expect(JSON.stringify(list)).not.toMatch(/tokenHash|fp_agent_/);
  expect((await DELETE(browser('DELETE', { id: 'token-id' }))).status).toBe(200);
  expect(db.agentAccessToken.deleteMany).toHaveBeenCalledWith({ where: { id: 'token-id', userId: 'customer-a' } });
});
