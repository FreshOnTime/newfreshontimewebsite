import type { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/subscriptions/[id]/route';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { nextWeekday } from '@/lib/subscriptionUtils';

jest.mock('@/lib/auth', () => ({ verifyToken: jest.fn() }));
jest.mock('@/lib/subscriptionUtils', () => ({
  serializeSubscription: (value: unknown) => value,
  nextWeekday: jest.fn(() => new Date('2026-10-08')),
  advanceByFrequency: () => new Date('2026-10-15'),
}));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  subscription: { findFirst: jest.fn(), findUnique: jest.fn() }, $transaction: jest.fn(),
} }));
const db = prisma as unknown as { subscription: { findFirst: jest.Mock; findUnique: jest.Mock }; $transaction: jest.Mock };
const tx = { subscription: { updateMany: jest.fn() }, subscriptionPlan: { updateMany: jest.fn() } };
const stored = { id: 'sub-1', userId: 'owner-1', planId: 'plan-1', status: 'active', updatedAt: new Date('2026-10-01'),
  nextDeliveryDate: new Date('2026-10-08'), deliverySlotDay: 'thursday', plan: { frequency: 'weekly' } };
const request = (body: unknown) => ({ json: async () => body }) as NextRequest;
const ctx = { params: Promise.resolve({ id: 'sub-1' }) };

describe('Subscription state transitions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyToken as jest.Mock).mockResolvedValue({ mongoId: 'owner-1' });
    db.subscription.findFirst.mockResolvedValue(stored);
    db.subscription.findUnique.mockResolvedValue(stored);
    db.$transaction.mockImplementation(async (callback: (value: typeof tx) => unknown) => callback(tx));
    tx.subscription.updateMany.mockResolvedValue({ count: 1 });
  });
  it('requires an authenticated owner', async () => {
    (verifyToken as jest.Mock).mockResolvedValue(null);
    expect((await PATCH(request({ action: 'pause' }), ctx)).status).toBe(401);
    expect(db.subscription.findFirst).not.toHaveBeenCalled();
  });
  it('looks up subscriptions within the authenticated account', async () => {
    db.subscription.findFirst.mockResolvedValue(null);
    expect((await PATCH(request({ action: 'pause' }), ctx)).status).toBe(404);
    expect(db.subscription.findFirst.mock.calls[0][0].where).toEqual({ id: 'sub-1', userId: 'owner-1' });
  });
  it('claims a cancellation before decrementing the subscriber count', async () => {
    expect((await PATCH(request({ action: 'cancel' }), ctx)).status).toBe(200);
    expect(tx.subscription.updateMany.mock.calls[0][0].where).toMatchObject({ status: 'active', nextDeliveryDate: stored.nextDeliveryDate, updatedAt: stored.updatedAt });
    expect(tx.subscriptionPlan.updateMany).toHaveBeenCalledWith({ where: { id: 'plan-1', currentSubscribers: { gt: 0 } }, data: { currentSubscribers: { decrement: 1 } } });
  });
  it('does not decrement the counter after a lost concurrent cancellation', async () => {
    tx.subscription.updateMany.mockResolvedValue({ count: 0 });
    expect((await PATCH(request({ action: 'cancel' }), ctx)).status).toBe(409);
    expect(tx.subscriptionPlan.updateMany).not.toHaveBeenCalled();
  });
  it('decrements once when two cancellations share the same stored version', async () => {
    tx.subscription.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const responses = await Promise.all([PATCH(request({ action: 'cancel' }), ctx), PATCH(request({ action: 'cancel' }), ctx)]);
    expect(responses.map((res) => res.status).sort()).toEqual([200, 409]);
    expect(tx.subscriptionPlan.updateMany).toHaveBeenCalledTimes(1);
  });
  it('advances a skipped delivery using a date-conditional update', async () => {
    expect((await PATCH(request({ action: 'skip' }), ctx)).status).toBe(200);
    expect(tx.subscription.updateMany.mock.calls[0][0].data).toMatchObject({ skippedDates: { push: stored.nextDeliveryDate }, skippedDeliveries: { increment: 1 }, nextDeliveryDate: new Date('2026-10-15') });
  });
  it('rejects a concurrent skip rather than skipping a second delivery', async () => {
    tx.subscription.updateMany.mockResolvedValue({ count: 0 });
    expect((await PATCH(request({ action: 'skip' }), ctx)).status).toBe(409);
  });
  it.each(['pause', 'skip', 'cancel'])('rejects %s on an already-cancelled subscription', async (action) => {
    db.subscription.findFirst.mockResolvedValue({ ...stored, status: 'cancelled' });
    expect((await PATCH(request({ action }), ctx)).status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('validates pause dates', async () => {
    expect((await PATCH(request({ action: 'pause', pauseUntil: 'invalid' }), ctx)).status).toBe(400);
    expect((await PATCH(request({ action: 'pause', pauseUntil: '2020-01-01T00:00:00Z' }), ctx)).status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('resumes only paused subscriptions', async () => {
    expect((await PATCH(request({ action: 'resume' }), ctx)).status).toBe(400);
    db.subscription.findFirst.mockResolvedValue({ ...stored, status: 'paused' });
    expect((await PATCH(request({ action: 'resume' }), ctx)).status).toBe(200);
    expect(tx.subscription.updateMany.mock.calls[0][0].data).toMatchObject({ status: 'active', pausedUntil: null });
  });
  it('ends a scheduled pause immediately when the owner explicitly resumes', async () => {
    const pausedUntil = new Date(Date.now() + 30 * 86400000);
    db.subscription.findFirst.mockResolvedValue({ ...stored, status: 'paused', pausedUntil });
    const before = Date.now();
    expect((await PATCH(request({ action: 'resume' }), ctx)).status).toBe(200);
    const base = (nextWeekday as jest.Mock).mock.calls[0][0] as Date;
    expect(base.getTime()).toBeGreaterThanOrEqual(before);
    expect(base.getTime()).toBeLessThan(pausedUntil.getTime());
  });
  it('keeps a future subscription start when resuming a pause', async () => {
    const startDate = new Date(Date.now() + 20 * 86400000);
    db.subscription.findFirst.mockResolvedValue({ ...stored, status: 'paused', startDate });
    expect((await PATCH(request({ action: 'resume' }), ctx)).status).toBe(200);
    expect(nextWeekday).toHaveBeenCalledWith(startDate, 'thursday');
  });
});
