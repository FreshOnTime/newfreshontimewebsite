import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBag } from '@/lib/bagSerializer';
import { POST, PATCH, DELETE } from '@/app/api/bags/[id]/items/route';
jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { bag: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() }, product: { findFirst: jest.fn() }, bagItem: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() } } }));
const db = prisma as unknown as { bag: { findFirst: jest.Mock; findUnique: jest.Mock; update: jest.Mock }; product: { findFirst: jest.Mock }; bagItem: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; deleteMany: jest.Mock } };
const product = { id: 'p1', sku: 'TOMATO', name: 'Tomatoes', slug: 'tomato', price: 19.99, discountPercentage: 15, stockQty: 10, archived: false, images: [] };
const bag = { id: 'bag1', name: 'Market bag', items: [{ id: 'item1', product, price: 99, quantity: 3 }] } as unknown as Parameters<typeof serializeBag>[0];
const request = (body: unknown = {}) => ({ url: 'https://freshpick.lk/api/bags/bag1/items?productId=p1', user: { userId: 'owner' }, json: async () => body }) as unknown as NextRequest;
const context = { params: Promise.resolve({ id: 'bag1' }) };
beforeEach(() => { jest.clearAllMocks(); db.bag.findFirst.mockResolvedValue({ id: 'bag1' }); db.product.findFirst.mockResolvedValue(product); db.bag.findUnique.mockResolvedValue(bag); db.bagItem.findMany.mockResolvedValue([]); db.bagItem.findUnique.mockResolvedValue(null); });
it('reprices saved carts at current rounded sale prices without discounting them twice', () => {
  expect(serializeBag(bag)).toMatchObject({ totalAmount: 50.97, items: [{ price: 16.99, product: { price: 16.99 } }] });
});
it('reserves no stock when adding a cart item and stores the current sale unit', async () => {
  expect((await POST(request({ productId: 'p1', quantity: 2 }), context)).status).toBe(200);
  expect(db.bagItem.upsert.mock.calls[0][0].create).toMatchObject({ price: 16.99, quantity: 2 });
});
it.each([0.5, 10001])('rejects quantity %s before querying catalogue or writing the bag', async (quantity) => {
  expect((await POST(request({ productId: 'p1', quantity }), context)).status).toBe(400); expect(db.product.findFirst).not.toHaveBeenCalled();
});
it('permits removal of archived products, including setting quantity to zero', async () => {
  await DELETE(request(), context); await PATCH(request({ productId: 'p1', quantity: 0 }), context);
  expect(db.product.findFirst.mock.calls.every(([args]) => args.where.archived === undefined)).toBe(true);
  expect(db.bagItem.deleteMany).toHaveBeenCalledTimes(2);
});
it('displays archived bag items as unavailable', () => {
  const value = structuredClone(bag); value.items[0].product.archived = true;
  expect(serializeBag(value).items[0].product.stockQty).toBe(0);
});
