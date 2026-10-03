import type { NextRequest } from 'next/server';
import { PUT, PATCH, DELETE } from '@/app/api/orders/recurring/[id]/route';
import { PUT as adminPut, PATCH as adminPatch, DELETE as adminDelete } from '@/app/api/admin/orders/recurring/[id]/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/middleware/adminAuth', () => ({ requireAdmin: (handler: unknown) => handler, logAuditAction: jest.fn() }));
jest.mock('@/lib/services/mailService', () => ({ sendOrderEmail: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  order: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn(), updateMany: jest.fn(), findUniqueOrThrow: jest.fn() }, $transaction: jest.fn(),
} }));
const db = prisma as unknown as { order: Record<string, jest.Mock>; $transaction: jest.Mock };
const tx = { order: { delete: jest.fn(), deleteMany: jest.fn() }, product: { update: jest.fn(), updateMany: jest.fn() } };
const stored = { id: 'schedule-1', customerId: 'owner-1', isRecurring: true, status: 'pending', paymentStatus: 'paid',
  scheduleStatus: 'paused', updatedAt: new Date('2026-10-01'), nextDeliveryAt: new Date('2026-11-01T09:00:00Z'),
  subtotal: 100, tax: 0, shipping: 0, discount: 0, total: 100,
  recurrence: { rruleString: 'DTSTART:20261001T090000Z\nRRULE:FREQ=MONTHLY;BYMONTHDAY=1' },
  items: [{ productId: 'p1', qty: 2, price: 50, total: 100 }], shippingAddress: {}, billingAddress: null };
const request = (body: unknown = {}, role = 'customer') => ({ json: async () => body, user: { userId: 'owner-1', mongoId: 'owner-1', role } }) as unknown as NextRequest;
const ctx = { params: Promise.resolve({ id: 'schedule-1' }) };

beforeEach(() => {
  jest.clearAllMocks();
  db.order.findUnique.mockResolvedValue(stored); db.order.findUniqueOrThrow.mockResolvedValue(stored);
  db.order.update.mockImplementation(async ({ data }) => ({ ...stored, ...data }));
  db.order.updateMany.mockResolvedValue({ count: 1 });
  db.order.create.mockImplementation(async ({ data }) => ({ ...stored, ...data, items: data.items?.create || stored.items }));
  tx.product.update.mockResolvedValue({});
  db.$transaction.mockImplementation(async (fn: (value: typeof tx) => unknown) => fn(tx));
  tx.order.deleteMany.mockResolvedValue({ count: 1 });
});

it.each([DELETE, adminDelete])('deletes a schedule without inventing product stock', async (remove) => {
  expect((await remove(request({}, 'admin'), ctx)).status).toBe(200);
  expect(tx.product.update).not.toHaveBeenCalled(); expect(tx.product.updateMany).not.toHaveBeenCalled();
});
it.each([DELETE, adminDelete])('rejects a delete whose stored version changed', async (remove) => {
  tx.order.deleteMany.mockResolvedValue({ count: 0 });
  expect((await remove(request({}, 'admin'), ctx)).status).toBe(409);
});
it('keeps a monthly RRULE active when the customer resumes it', async () => {
  const res = await PATCH(request({ action: 'resume' }), ctx);
  expect(res.status).toBe(200);
  expect((await res.json()).data).toMatchObject({ scheduleStatus: 'active' });
});
it('does not reactivate a paused schedule while editing recurrence notes', async () => {
  const res = await PUT(request({ recurrence: { notes: 'Leave at reception' } }), ctx);
  expect(res.status).toBe(200);
  expect((await res.json()).data).toMatchObject({ scheduleStatus: 'paused' });
});
it('keeps a future start date when recalculating a weekday schedule', async () => {
  const future = new Date(Date.now() + 60 * 86400000);
  db.order.findUnique.mockResolvedValue({ ...stored, recurrence: { startDate: future.toISOString(), daysOfWeek: [future.getDay()] } });
  const res = await PUT(request({ recurrence: { notes: 'Future schedule' } }), ctx);
  expect(res.status).toBe(200);
  expect(new Date((await res.json()).data.nextDeliveryAt).getTime()).toBe(future.getTime());
});
it.each([PUT, adminPut])('rejects converting a schedule into an unreserved ordinary order', async (update) => {
  expect((await update(request({ isRecurring: false }, 'admin'), ctx)).status).toBe(400);
  expect(db.order.update).not.toHaveBeenCalled(); expect(db.order.updateMany).not.toHaveBeenCalled();
});
it.each(['not-a-date', '2026-15-90'])('rejects malformed recurrence dates as client errors: %s', async (startDate) => {
  expect((await PUT(request({ recurrence: { startDate, daysOfWeek: [1] } }), ctx)).status).toBe(400);
  expect(db.order.update).not.toHaveBeenCalled();
});
it('does not copy a paid payment status into a duplicated schedule', async () => {
  const res = await adminPatch(request({ action: 'duplicate' }, 'admin'), ctx);
  expect(res.status).toBe(200);
  expect((await res.json()).data.paymentStatus).toBe('pending');
});
