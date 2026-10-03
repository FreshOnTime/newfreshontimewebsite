import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import { GET as inbox, POST as send } from '@/app/api/messages/route';
import { PUT as read } from '@/app/api/messages/[id]/read/route';
import { POST as applyReferral, PATCH as reward } from '@/app/api/referrals/route';
import { PATCH as profile } from '@/app/api/profile/route';
import prisma from '@/lib/prisma';

let mockToken = '';
jest.mock('next/server', () => jest.requireActual('next/server'));
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => mockToken ? { value: mockToken } : undefined }) }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  user: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  message: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), createMany: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  referral: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  referredUser: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  order: { findFirst: jest.fn(), findUnique: jest.fn() }, auditLog: { create: jest.fn() },
  $transaction: jest.fn(), $queryRaw: jest.fn(),
} }));
const db = prisma as unknown as Record<string, Record<string, jest.Mock>> & { $transaction: jest.Mock; $queryRaw: jest.Mock };
const actor = { id: 'actor', role: 'customer', secondaryRoles: [], isBanned: false, email: 'a@example.com', phoneNumber: '0771234567' };
const referral = { id: 'ref-1', code: 'FRESHABC', ownerId: 'producer', isActive: true };
const entry = { id: 'entry-1', userId: 'actor', referralId: 'ref-1', appliedAt: new Date('2026-10-01'), rewardPaid: false, orderPlaced: false };
const order = { id: 'order-1', customerId: 'actor', isRecurring: false, status: 'delivered', paymentStatus: 'paid', total: 1000, createdAt: new Date('2026-10-02') };
function req(path: string, method = 'GET', body?: unknown, type = 'access', role = 'customer', authenticated = true) {
  mockToken = authenticated ? sign({ userId: actor.id, role, type }, process.env.JWT_SECRET!) : '';
  return new NextRequest('http://localhost' + path, { method, headers: mockToken ? { cookie: `accessToken=${mockToken}` } : {}, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
}
beforeEach(() => {
  jest.clearAllMocks();
  db.user.findUnique.mockResolvedValue(actor); db.user.findFirst.mockResolvedValue(null); db.user.findMany.mockResolvedValue([{ id: 'linked-user' }]); db.user.update.mockResolvedValue(actor);
  db.message.findMany.mockResolvedValue([]); db.message.count.mockResolvedValue(0); db.message.findUnique.mockResolvedValue({ id: 'm1', recipientId: 'actor' });
  db.message.create.mockImplementation(async ({ data }) => ({ id: 'm1', ...data })); db.message.updateMany.mockResolvedValue({ count: 1 });
  db.message.update.mockResolvedValue({ id: 'm1', recipientId: 'actor', isRead: true });
  db.referral.findFirst.mockResolvedValue(referral); db.referredUser.findUnique.mockResolvedValue(null); db.referredUser.findFirst.mockResolvedValue(entry);
  db.referredUser.updateMany.mockResolvedValue({ count: 1 }); db.order.findFirst.mockResolvedValue(order); db.order.findUnique.mockResolvedValue(order);
  db.$transaction.mockImplementation(async (fn: unknown) => typeof fn === 'function' ? fn(db) : Promise.all(fn as Promise<unknown>[]));
});
it('rejects public referral attribution and rewards before any write', async () => {
  expect((await applyReferral(req('/api/referrals', 'POST', { code: 'FRESHABC', userId: 'target' }, 'access', 'customer', false))).status).toBe(401);
  expect((await reward(req('/api/referrals', 'PATCH', { referralCode: 'FRESHABC', userId: 'actor', orderId: 'order-1' }, 'access', 'customer', false))).status).toBe(401);
  expect(db.referredUser.create).not.toHaveBeenCalled(); expect(db.referral.update).not.toHaveBeenCalled();
});
it('rejects referral attribution to another account', async () => {
  expect((await applyReferral(req('/api/referrals', 'POST', { code: 'FRESHABC', userId: 'target' }))).status).toBe(403);
  expect(db.$transaction).not.toHaveBeenCalled();
});
it('does not allow customers to mark their own rewards successful', async () => {
  expect((await reward(req('/api/referrals', 'PATCH', { referralCode: 'FRESHABC', userId: 'actor', orderId: 'order-1' }))).status).toBe(403);
  expect(db.referral.update).not.toHaveBeenCalled();
});
it.each([{ ...order, paymentStatus: 'pending' }, { ...order, status: 'pending' }, { ...order, customerId: 'other' }, { ...order, isRecurring: true }, { ...order, total: 0 }])('rejects nonqualifying referral order evidence', async (evidence) => {
  db.user.findUnique.mockResolvedValue({ ...actor, role: 'admin' }); db.order.findUnique.mockResolvedValue(evidence);
  expect((await reward(req('/api/referrals', 'PATCH', { referralCode: 'FRESHABC', userId: 'actor', orderId: 'order-1' }, 'access', 'admin'))).status).toBe(400);
  expect(db.referral.update).not.toHaveBeenCalled();
});
it('awards a verified referral once even if the same evidence is submitted concurrently', async () => {
  db.user.findUnique.mockResolvedValue({ ...actor, role: 'admin' });
  db.referredUser.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
  const body = { referralCode: 'FRESHABC', userId: 'actor', orderId: 'order-1' };
  const results = await Promise.all([reward(req('/api/referrals', 'PATCH', body, 'access', 'admin')), reward(req('/api/referrals', 'PATCH', body, 'access', 'admin'))]);
  expect(results.every(r => r.status === 200)).toBe(true); expect(db.referral.update).toHaveBeenCalledTimes(1); expect(db.auditLog.create).toHaveBeenCalledTimes(1);
});
it.each([inbox, (r: NextRequest) => read(r, { params: Promise.resolve({ id: 'm1' }) })])('rejects refresh tokens used to access account messages', async (handler) => {
  expect((await handler(req('/api/messages', 'GET', undefined, 'refresh'))).status).toBe(401);
});
it('does not let a stale admin JWT send messages after role removal', async () => {
  expect((await send(req('/api/messages', 'POST', { recipientId: 'target', subject: 'Delivery', content: 'Ready' }, 'access', 'admin'))).status).toBe(403);
  expect(db.message.create).not.toHaveBeenCalled(); expect(db.message.createMany).not.toHaveBeenCalled();
});
it('keeps the inbox private and scopes reads to the authenticated recipient', async () => {
  const response = await inbox(req('/api/messages'));
  expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(db.message.findMany.mock.calls[0][0].where.recipientId).toBe('actor');
});
it('does not mark another recipient\'s message read', async () => {
  db.message.findUnique.mockResolvedValue({ id: 'm1', recipientId: 'other' });
  expect((await read(req('/api/messages/m1/read', 'PUT'), { params: Promise.resolve({ id: 'm1' }) })).status).toBe(404);
  expect(db.message.update).not.toHaveBeenCalled(); expect(db.message.updateMany).not.toHaveBeenCalled();
});
it('rejects malformed inbox pagination before querying messages', async () => {
  expect((await inbox(req('/api/messages?page=oops'))).status).toBe(400);
  expect(db.message.findMany).not.toHaveBeenCalled();
});
it('blocks banned accounts from editing profile details', async () => {
  db.user.findUnique.mockResolvedValue({ ...actor, isBanned: true });
  expect((await profile(req('/api/profile', 'PATCH', { firstName: 'Name', email: actor.email, phoneNumber: actor.phoneNumber }))).status).toBe(403);
  expect(db.user.update).not.toHaveBeenCalled();
});
it('records the signed-in customer referral once and replays the same attribution', async () => {
  db.referredUser.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(entry);
  db.order.findFirst.mockResolvedValue(null);
  const body = { code: 'freshabc' };
  expect((await applyReferral(req('/api/referrals', 'POST', body))).status).toBe(201);
  expect((await applyReferral(req('/api/referrals', 'POST', body))).status).toBe(200);
  expect(db.referredUser.create).toHaveBeenCalledTimes(1);
  expect(db.referredUser.create.mock.calls[0][0].data.userId).toBe('actor');
  expect(db.referral.update).toHaveBeenCalledTimes(1);
});
it('rejects replacing an existing referral with another code', async () => {
  db.referredUser.findFirst.mockResolvedValue({ ...entry, referralId: 'different' });
  expect((await applyReferral(req('/api/referrals', 'POST', { code: 'FRESHABC' }))).status).toBe(409);
  expect(db.referredUser.create).not.toHaveBeenCalled();
});
it('rejects self-referrals and referrals recorded after a purchase', async () => {
  db.referral.findFirst.mockResolvedValueOnce({ ...referral, ownerId: actor.id });
  expect((await applyReferral(req('/api/referrals', 'POST', { code: 'FRESHABC' }))).status).toBe(400);
  db.referredUser.findFirst.mockResolvedValue(null);
  expect((await applyReferral(req('/api/referrals', 'POST', { code: 'FRESHABC' }))).status).toBe(409);
  expect(db.referredUser.create).not.toHaveBeenCalled();
});
it('does not reward a later purchase or an order preceding attribution', async () => {
  db.user.findUnique.mockResolvedValue({ ...actor, role: 'admin' });
  db.order.findFirst.mockResolvedValue({ id: 'earlier-order' });
  const body = { referralCode: 'FRESHABC', userId: actor.id, orderId: order.id };
  expect((await reward(req('/api/referrals', 'PATCH', body))).status).toBe(400);
  db.order.findUnique.mockResolvedValue({ ...order, createdAt: new Date('2026-09-01') });
  expect((await reward(req('/api/referrals', 'PATCH', body))).status).toBe(400);
  expect(db.referral.update).not.toHaveBeenCalled();
});
it('requires order evidence even from an administrator', async () => {
  db.user.findUnique.mockResolvedValue({ ...actor, role: 'admin' });
  expect((await reward(req('/api/referrals', 'PATCH', { referralCode: 'FRESHABC', userId: actor.id }))).status).toBe(400);
  expect(db.referral.update).not.toHaveBeenCalled();
});
it('returns an actionable error for a producer without an active linked account', async () => {
  db.user.findUnique.mockResolvedValue({ ...actor, role: 'admin' }); db.user.findMany.mockResolvedValue([]);
  const response = await send(req('/api/messages', 'POST', { supplierId: 'supplier-1', subject: 'Delivery', content: 'Ready' }));
  expect(response.status).toBe(404); expect((await response.json()).message).toContain('no active linked');
  expect(db.message.createMany).not.toHaveBeenCalled();
});
