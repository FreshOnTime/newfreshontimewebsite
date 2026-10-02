import { NextResponse, type NextRequest } from 'next/server';
import { GET as listOrders } from '@/app/api/orders/route';
import { PATCH, PUT, DELETE } from '@/app/api/orders/[id]/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/services/mailService', () => ({ sendOrderEmail: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  order: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn() }, $transaction: jest.fn(),
} }));

const db = prisma as unknown as { order: { findUnique: jest.Mock; findMany: jest.Mock; count: jest.Mock }; $transaction: jest.Mock };
const tx = { order: { updateMany: jest.fn(), deleteMany: jest.fn(), findUniqueOrThrow: jest.fn() }, product: { updateMany: jest.fn() } };
const context = { params: Promise.resolve({ id: 'order-1' }) };
const stored = { id: 'order-1', customerId: 'customer-1', orderNumber: 'ORD-1', status: 'pending', isRecurring: false,
  updatedAt: new Date('2026-10-01'), subtotal: 100, shipping: 0, discount: 0, total: 100, tax: 0,
  items: [{ productId: 'product-1', qty: 2, price: 50, total: 100 }] };
const address = { name: ' Customer ', phone: ' 0771234567 ', street: ' Market Road ', city: ' Colombo ', country: ' LK ' };
const request = (body: unknown = {}, role = 'customer', query = '') => ({
  url: 'https://freshpick.lk/api/orders/order-1' + query, json: async () => body,
  user: { userId: 'customer-1', mongoId: 'customer-1', role, email: 'sample@example.test' },
}) as unknown as NextRequest;

describe('Customer order management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.order.findUnique.mockResolvedValue(stored);
    db.order.findMany.mockResolvedValue([stored]); db.order.count.mockResolvedValue(21);
    db.$transaction.mockImplementation(async (callback: (value: typeof tx) => unknown) => callback(tx));
    tx.order.updateMany.mockResolvedValue({ count: 1 }); tx.order.deleteMany.mockResolvedValue({ count: 1 });
    tx.order.findUniqueOrThrow.mockResolvedValue({ ...stored, status: 'cancelled' });
    tx.product.updateMany.mockResolvedValue({ count: 1 });
  });

  it('returns usable IDs, deterministic pagination, and uncached order summaries', async () => {
    const res = await listOrders(request({}, 'customer', '?summary=1&page=2&limit=20'), undefined);
    expect(await res.json()).toMatchObject({ data: { orders: [{ _id: 'order-1' }], pagination: { page: 2, total: 21, hasPrev: true } } });
    expect(db.order.findMany.mock.calls[0][0]).toMatchObject({ skip: 20, take: 20, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
    expect(NextResponse.json).toHaveBeenLastCalledWith(expect.anything(), { headers: { 'Cache-Control': 'private, no-store' } });
  });
  it('defaults malformed pagination without passing NaN to the database', async () => {
    await listOrders(request({}, 'customer', '?page=garbage&limit=Infinity'), undefined);
    expect(db.order.findMany.mock.calls[0][0]).toMatchObject({ skip: 0, take: 10 });
  });
  it('does not allow customers to query another customer', async () => {
    await listOrders(request({}, 'customer', '?userId=another'), undefined);
    expect(db.order.findMany.mock.calls[0][0].where).toEqual({ customerId: 'customer-1' });
  });
  it('claims the reservation before releasing stock', async () => {
    const res = await PATCH(request({ action: 'cancel' }), context);
    expect(res.status).toBe(200);
    expect(tx.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'order-1', status: 'pending', updatedAt: stored.updatedAt } }));
    expect(tx.product.updateMany).toHaveBeenCalledWith({ where: { id: 'product-1' }, data: { stockQty: { increment: 2 } } });
    expect(tx.order.updateMany.mock.invocationCallOrder[0]).toBeLessThan(tx.product.updateMany.mock.invocationCallOrder[0]);
  });
  it('rejects a lost concurrent claim without releasing stock', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 0 });
    expect((await PATCH(request({ action: 'cancel' }), context)).status).toBe(409);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
  });
  it('only releases once when two cancellations read the same order version', async () => {
    tx.order.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const responses = await Promise.all([PATCH(request({ action: 'cancel' }), context), PATCH(request({ action: 'cancel' }), context)]);
    expect(responses.map((res) => res.status).sort()).toEqual([200, 409]);
    expect(tx.product.updateMany).toHaveBeenCalledTimes(1);
  });
  it('does not release stock again for an already-cancelled order', async () => {
    db.order.findUnique.mockResolvedValue({ ...stored, status: 'cancelled' });
    expect((await PATCH(request({ action: 'cancel' }), context)).status).toBe(200);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
  });
  it('ends a recurring template without releasing unreserved stock', async () => {
    db.order.findUnique.mockResolvedValue({ ...stored, isRecurring: true });
    await PATCH(request({ action: 'cancel' }), context);
    expect(tx.order.updateMany.mock.calls[0][0].data).toMatchObject({ scheduleStatus: 'ended', nextDeliveryAt: null });
    expect(tx.product.updateMany).not.toHaveBeenCalled();
  });
  it.each(['shipped', 'delivered', 'refunded'])('rejects customer cancellation in %s state', async (status) => {
    db.order.findUnique.mockResolvedValue({ ...stored, status });
    expect((await PATCH(request({ action: 'cancel' }), context)).status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('rejects another customer’s cancellation', async () => {
    db.order.findUnique.mockResolvedValue({ ...stored, customerId: 'other' });
    expect((await PATCH(request({ action: 'cancel' }), context)).status).toBe(403);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('prevents a status-only reopen after stock was released', async () => {
    db.order.findUnique.mockResolvedValue({ ...stored, status: 'cancelled' });
    expect((await PATCH(request({ action: 'status:confirmed' }, 'admin'), context)).status).toBe(400);
  });
  it('validates and trims delivery address edits', async () => {
    expect((await PUT(request({ shippingAddress: { ...address, city: '   ' } }), context)).status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
    expect((await PUT(request({ shippingAddress: address }), context)).status).toBe(200);
    expect(tx.order.updateMany.mock.calls[0][0].data.shippingAddress).toMatchObject({ name: 'Customer', city: 'Colombo', phone: '0771234567' });
  });
  it('rejects an address update that raced with shipment', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 0 });
    expect((await PUT(request({ shippingAddress: address }), context)).status).toBe(409);
  });
  it('does not allow customer hard deletion', async () => {
    expect((await DELETE(request({}, 'customer'), context)).status).toBe(403);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('claims admin deletion before releasing a held reservation', async () => {
    expect((await DELETE(request({}, 'admin'), context)).status).toBe(200);
    expect(tx.order.deleteMany).toHaveBeenCalledWith({ where: { id: 'order-1', status: 'pending', updatedAt: stored.updatedAt } });
    expect(tx.product.updateMany).toHaveBeenCalledTimes(1);
  });
  it('does not release template stock when deleting a recurring schedule', async () => {
    db.order.findUnique.mockResolvedValue({ ...stored, isRecurring: true });
    await DELETE(request({}, 'admin'), context);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
  });
});
