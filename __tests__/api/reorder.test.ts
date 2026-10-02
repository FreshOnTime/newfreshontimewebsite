import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/bags/reorder/route';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({ verifyToken: jest.fn() }));
jest.mock('@/lib/bagSerializer', () => ({ BAG_INCLUDE: {}, serializeBag: (bag: unknown) => bag, bagTotal: (items: { price: number; quantity: number }[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0) }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { order: { findFirst: jest.fn() }, product: { findUnique: jest.fn() }, bag: { create: jest.fn() } } }));
const db = prisma as unknown as { order: { findFirst: jest.Mock }; product: { findUnique: jest.Mock }; bag: { create: jest.Mock } };
const request = (body: unknown) => ({ json: async () => body }) as NextRequest;
const product = { id: 'p1', name: 'Tomatoes', stockQty: 2, price: 300, archived: false };

beforeEach(() => {
  jest.clearAllMocks();
  (verifyToken as jest.Mock).mockResolvedValue({ mongoId: 'owner' });
  db.order.findFirst.mockResolvedValue({ orderNumber: 'ORD-1', items: [{ productId: 'p1', name: 'Tomatoes', qty: 3, price: 100 }] });
  db.product.findUnique.mockResolvedValue(product);
  db.bag.create.mockResolvedValue({ _id: 'bag-1' });
});

describe('Buy again', () => {
  it('uses current prices, caps quantities, and reports partial availability', async () => {
    const res = await POST(request({ orderId: 'order-1' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ bag: { _id: 'bag-1' }, unavailableItems: [{ name: 'Tomatoes', reason: 'Only 2 available (requested 3)' }] });
    expect(db.bag.create.mock.calls[0][0].data).toMatchObject({ userId: 'owner', totalAmount: 600, items: { create: [{ productId: 'p1', quantity: 2, price: 300 }] } });
  });
  it.each([{ ...product, stockQty: 0 }, { ...product, stockQty: -1 }, { ...product, archived: true }, null])('does not create an empty or unavailable bag', async (value) => {
    db.product.findUnique.mockResolvedValue(value);
    expect((await POST(request({ orderId: 'order-1' }))).status).toBe(400);
    expect(db.bag.create).not.toHaveBeenCalled();
  });
  it('cannot reorder another customer’s order', async () => {
    db.order.findFirst.mockResolvedValue(null);
    expect((await POST(request({ orderId: 'other-order' }))).status).toBe(404);
    expect(db.order.findFirst.mock.calls[0][0].where).toEqual({ id: 'other-order', customerId: 'owner' });
    expect(db.bag.create).not.toHaveBeenCalled();
  });
  it('rejects invalid order identifiers before querying', async () => {
    expect((await POST(request({ orderId: {} }))).status).toBe(400);
    expect(db.order.findFirst).not.toHaveBeenCalled();
  });
});
