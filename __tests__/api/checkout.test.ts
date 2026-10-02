import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { POST } from '@/app/api/orders/route';
import { POST as quoteOrder } from '@/app/api/orders/quote/route';
import { GET as receipt } from '@/app/api/orders/receipt/route';
import { prepareCheckout, checkoutRequestHash, checkoutSchema } from '@/lib/checkoutService';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/services/mailService', () => ({ sendOrderEmail: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  product: { findMany: jest.fn() }, user: { findUnique: jest.fn() }, bag: { findFirst: jest.fn() },
  checkoutRequest: { findUnique: jest.fn() }, $transaction: jest.fn(),
} }));
const db = prisma as unknown as { product: { findMany: jest.Mock }; user: { findUnique: jest.Mock }; bag: { findFirst: jest.Mock }; checkoutRequest: { findUnique: jest.Mock }; $transaction: jest.Mock };
const tx = { product: { updateMany: jest.fn() }, order: { create: jest.fn() }, checkoutRequest: { create: jest.fn(), update: jest.fn() } };
const product = { id: 'p1', sku: 'TOMATO', slug: 'tomato', name: 'Tomatoes', price: 20, discountPercentage: 25, stockQty: 10 };
const body = { items: [{ productId: 'p1', quantity: 2 }], shippingAddress: { name: 'Customer', street: 'Market Road', city: 'Colombo', country: 'LK', phone: '0771234567' } };
const request = (data: unknown = body, key = 'retry-key-1', customerId = 'customer-1') => ({
  url: `https://freshpick.lk/api/orders/receipt?key=${key}`, headers: new Headers({ 'Idempotency-Key': key }),
  user: { userId: customerId, role: 'customer' }, json: async () => data,
}) as unknown as NextRequest;
beforeEach(() => {
  jest.clearAllMocks(); db.product.findMany.mockResolvedValue([product]); db.user.findUnique.mockResolvedValue({ addresses: [] });
  db.bag.findFirst.mockResolvedValue({ id: 'bag1' }); db.checkoutRequest.findUnique.mockResolvedValue(null);
  db.$transaction.mockImplementation(async (callback: (value: typeof tx) => unknown) => callback(tx));
  tx.product.updateMany.mockResolvedValue({ count: 1 }); tx.checkoutRequest.create.mockResolvedValue({}); tx.checkoutRequest.update.mockResolvedValue({});
  tx.order.create.mockImplementation(async ({ data }) => ({ ...data, id: 'order1', items: data.items.create }));
});
describe('Checkout integrity', () => {
  it('quotes sale prices, delivery, and canonical IDs before checkout', async () => {
    const res = await quoteOrder(request({ items: [{ productId: 'TOMATO', quantity: 2 }] }), undefined);
    expect(await res.json()).toMatchObject({ quote: { subtotal: 30, shipping: 5, total: 35, items: [{ productId: 'p1', price: 15, total: 30 }] } });
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('merges aliases before checking stock and calculating totals', async () => {
    const result = await prepareCheckout([{ productId: 'p1', quantity: 2 }, { productId: 'TOMATO', quantity: 3 }]);
    expect(result.quote).toMatchObject({ subtotal: 75, shipping: 0, total: 75, items: [{ quantity: 5 }] });
    await expect(prepareCheckout([{ productId: 'p1', quantity: 6 }, { productId: 'tomato', quantity: 6 }])).rejects.toThrow('Insufficient stock');
  });
  it.each([{ discount: 100 }, { paymentMethod: 'card' }, { items: [{ productId: 'p1', quantity: 0.5 }] }, { recurrence: { startDate: 'invalid' } }])('rejects unsafe checkout input %j before database writes', async (extra) => {
    expect((await POST(request({ ...body, ...extra }), undefined)).status).toBe(400); expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('rejects stale quotes without reserving inventory', async () => {
    expect((await POST(request({ ...body, quoteFingerprint: '0'.repeat(64) }), undefined)).status).toBe(409);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('checks bag ownership even when item IDs are valid', async () => {
    db.bag.findFirst.mockResolvedValue(null);
    expect((await POST(request({ ...body, bagId: 'another-bag' }), undefined)).status).toBe(404);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('claims a retry key before reserving stock and stores the receipt in the same transaction', async () => {
    const { quote } = await prepareCheckout(body.items);
    const res = await POST(request({ ...body, quoteFingerprint: quote.fingerprint, userId: 'attacker-id' }), undefined);
    expect(res.status).toBe(201); expect(await res.json()).toMatchObject({ data: { customerId: 'customer-1', total: 35 } });
    expect(tx.product.updateMany).toHaveBeenCalledWith({ where: { id: 'p1', archived: false, price: 20, discountPercentage: 25, stockQty: { gte: 2 } }, data: { stockQty: { decrement: 2 } } });
    expect(tx.checkoutRequest.create.mock.invocationCallOrder[0]).toBeLessThan(tx.product.updateMany.mock.invocationCallOrder[0]);
    expect(tx.checkoutRequest.update.mock.calls[0][0].data.response).toMatchObject({ success: true, data: { _id: 'order1', total: 35 } });
  });
  it('replays completed checkout before rechecking consumed stock or changed prices', async () => {
    db.checkoutRequest.findUnique.mockResolvedValue({ fingerprint: checkoutRequestHash(checkoutSchema.parse(body)), response: { success: true, data: { _id: 'original' } } });
    expect(await (await POST(request(), undefined)).json()).toMatchObject({ data: { _id: 'original' } });
    expect(db.product.findMany).not.toHaveBeenCalled(); expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('rejects reuse of a key for a different basket', async () => {
    db.checkoutRequest.findUnique.mockResolvedValue({ fingerprint: 'another', response: {} });
    expect((await POST(request(), undefined)).status).toBe(409); expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('returns the winning receipt after a concurrent unique-key collision', async () => {
    db.checkoutRequest.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ fingerprint: checkoutRequestHash(checkoutSchema.parse(body)), response: { success: true, data: { _id: 'winner' } } });
    db.$transaction.mockRejectedValue({ code: 'P2002' });
    expect(await (await POST(request(), undefined)).json()).toMatchObject({ data: { _id: 'winner' } });
  });
  it('rejects a price or stock change during reservation', async () => {
    tx.product.updateMany.mockResolvedValue({ count: 0 });
    expect((await POST(request(), undefined)).status).toBe(409); expect(tx.order.create).not.toHaveBeenCalled(); expect(tx.checkoutRequest.update).not.toHaveBeenCalled();
  });
  it('recovers receipts by authenticated customer and key only', async () => {
    db.checkoutRequest.findUnique.mockResolvedValue({ response: { data: { _id: 'original' } } });
    expect(await (await receipt(request({}, 'retry-key-1', 'owner'), undefined)).json()).toMatchObject({ receipt: { data: { _id: 'original' } } });
    expect(db.checkoutRequest.findUnique).toHaveBeenCalledWith({ where: { customerId_key: { customerId: 'owner', key: 'retry-key-1' } }, select: { response: true } });
  });
  it('returns a retryable failure if receipt lookup is unavailable, without beginning reservation', async () => {
    db.checkoutRequest.findUnique.mockRejectedValue(new Error('temporary database failure'));
    expect((await POST(request(), undefined)).status).toBe(500); expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('returns a failure if the concurrent receipt cannot be recovered, without throwing past the API boundary', async () => {
    db.checkoutRequest.findUnique.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('temporary database failure'));
    db.$transaction.mockRejectedValue({ code: 'P2002' });
    expect((await POST(request(), undefined)).status).toBe(500);
  });

});
