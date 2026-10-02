import type { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/admin/orders/[id]/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/middleware/adminAuth', () => ({ requireAdmin: (handler: unknown) => handler, logAuditAction: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { order: { findUnique: jest.fn() }, $transaction: jest.fn() } }));
const db = prisma as unknown as { order: { findUnique: jest.Mock }; $transaction: jest.Mock };
const tx = { order: { updateMany: jest.fn(), deleteMany: jest.fn(), findUniqueOrThrow: jest.fn() },
  product: { updateMany: jest.fn() }, orderItem: { deleteMany: jest.fn(), createMany: jest.fn() } };
const item = { productId: 'p1', sku: 'tomato', name: 'Tomatoes', qty: 2, price: 50, total: 100 };
const order = { id: 'o1', status: 'pending', isRecurring: false, updatedAt: new Date('2026-10-01'), items: [item], subtotal: 100, total: 100 };
const request = (body: unknown) => ({ json: async () => body, user: { userId: 'admin-1' } }) as unknown as NextRequest;
const ctx = { params: Promise.resolve({ id: 'o1' }) };

beforeEach(() => {
  jest.clearAllMocks();
  db.order.findUnique.mockResolvedValue(order);
  db.$transaction.mockImplementation(async (callback: (value: typeof tx) => unknown) => callback(tx));
  tx.order.updateMany.mockResolvedValue({ count: 1 }); tx.order.deleteMany.mockResolvedValue({ count: 1 });
  tx.order.findUniqueOrThrow.mockResolvedValue(order); tx.product.updateMany.mockResolvedValue({ count: 1 });
});

describe('Admin order inventory reconciliation', () => {
  it('restores a reservation on cancellation', async () => {
    expect((await PUT(request({ status: 'cancelled' }), ctx)).status).toBe(200);
    expect(tx.product.updateMany).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stockQty: { increment: 2 } } });
  });
  it('does not restore twice or reopen cancelled reservations', async () => {
    db.order.findUnique.mockResolvedValue({ ...order, status: 'cancelled' });
    expect((await PUT(request({ status: 'cancelled' }), ctx)).status).toBe(200);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect((await PUT(request({ status: 'confirmed' }), ctx)).status).toBe(400);
  });
  it('rejects a concurrent cancellation before touching inventory or items', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 0 });
    expect((await PUT(request({ status: 'cancelled' }), ctx)).status).toBe(409);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.orderItem.deleteMany).not.toHaveBeenCalled();
  });
  it('ends templates without inventing stock', async () => {
    db.order.findUnique.mockResolvedValue({ ...order, isRecurring: true });
    await PUT(request({ status: 'cancelled' }), ctx);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.order.updateMany.mock.calls[0][0].data).toMatchObject({ scheduleStatus: 'ended', nextDeliveryAt: null });
  });
  it('reserves only the net added quantity before replacing items', async () => {
    expect((await PUT(request({ items: [{ ...item, qty: 5, total: 250 }] }), ctx)).status).toBe(200);
    expect(tx.product.updateMany).toHaveBeenCalledWith({ where: { id: 'p1', archived: false, stockQty: { gte: 3 } }, data: { stockQty: { decrement: 3 } } });
    expect(tx.orderItem.createMany).toHaveBeenCalled();
  });
  it('rejects unavailable extra quantities before replacing items', async () => {
    tx.product.updateMany.mockResolvedValue({ count: 0 });
    expect((await PUT(request({ items: [{ ...item, qty: 5, total: 250 }] }), ctx)).status).toBe(400);
    expect(tx.orderItem.createMany).not.toHaveBeenCalled();
  });
  it('returns reduced quantities to stock', async () => {
    await PUT(request({ items: [{ ...item, qty: 1, total: 50 }] }), ctx);
    expect(tx.product.updateMany).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stockQty: { increment: 1 } } });
  });
  it('releases the original reservation when cancellation also changes items', async () => {
    await PUT(request({ status: 'cancelled', items: [{ ...item, qty: 5, total: 250 }] }), ctx);
    expect(tx.product.updateMany).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stockQty: { increment: 2 } } });
  });
  it.each(['shipped', 'delivered', 'cancelled', 'refunded'])('rejects item changes on %s orders', async (status) => {
    db.order.findUnique.mockResolvedValue({ ...order, status });
    expect((await PUT(request({ items: [item] }), ctx)).status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('cannot convert a real order into an unreserved template', async () => {
    expect((await PUT(request({ isRecurring: true }), ctx)).status).toBe(400);
  });
  it('restores held stock when deleting a real order', async () => {
    expect((await DELETE(request({}), ctx)).status).toBe(200);
    expect(tx.order.deleteMany).toHaveBeenCalled();
    expect(tx.product.updateMany).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stockQty: { increment: 2 } } });
  });
  it('does not restore stock when deleting a template', async () => {
    db.order.findUnique.mockResolvedValue({ ...order, isRecurring: true });
    await DELETE(request({}), ctx);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
  });
});
