import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { POST } from '@/app/api/assistant/confirm/route';
import { prepareCheckout } from '@/lib/checkoutService';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  bag: { findUnique: jest.fn(), create: jest.fn() },
  product: { findMany: jest.fn() },
} }));
const db = prisma as unknown as {
  bag: { findUnique: jest.Mock; create: jest.Mock };
  product: { findMany: jest.Mock };
};
const prod = { id: 'p1', sku: 'P1', slug: 'tomato', name: 'Tomatoes', description: 'Fresh',
  price: 20, discountPercentage: 25, stockQty: 10, archived: false };
const key = '4818b6d0-e90e-493e-8fb7-1ac6fbf1302a';
const lines = [{ productId: 'p1', quantity: 1 }];
const request = (payload: unknown, userId = 'owner') =>
  ({ user: { userId }, json: async () => payload }) as unknown as NextRequest;
const fakeBag = (data: { id: string; userId: string; name: string; description: string; tags: string[] }) => ({
  id: data.id, userId: data.userId, name: data.name, description: data.description,
  tags: data.tags, isActive: true, createdAt: new Date(), updatedAt: new Date(),
  items: [{ id: 'item1', quantity: 1, price: 15, product: { ...prod, images: [], image: null } }],
});

beforeEach(() => {
  jest.clearAllMocks();
  db.product.findMany.mockResolvedValue([prod]);
  db.bag.findUnique.mockResolvedValue(null);
  db.bag.create.mockImplementation(async ({ data }) => fakeBag(data));
});

it('creates an approved bag only after matching an authoritative checkout fingerprint and budget', async () => {
  const { quote } = await prepareCheckout(lines);
  const res = await POST(request({ items: lines, budgetLkr: 30, quoteFingerprint: quote.fingerprint,
    idempotencyKey: key }), undefined);
  expect(res.status).toBe(201);
  expect(db.bag.create.mock.calls[0][0].data).toMatchObject({
    userId: 'owner', totalAmount: 15, items: { create: [{ productId: 'p1', price: 15, quantity: 1 }] },
  });
  expect((await res.json()).data.totalAmount).toBe(15);
});

it('never saves a stale fingerprint or a proposal beyond budget', async () => {
  expect((await POST(request({ items: lines, budgetLkr: 25,
    quoteFingerprint: '0'.repeat(64), idempotencyKey: key }), undefined)).status).toBe(409);
  expect((await POST(request({ items: lines, budgetLkr: 18,
    quoteFingerprint: (await prepareCheckout(lines)).quote.fingerprint, idempotencyKey: key }), undefined)).status).toBe(409);
  expect(db.bag.create).not.toHaveBeenCalled();
});

it('returns the already created bag for the same approval and rejects key reuse with different data', async () => {
  const { quote } = await prepareCheckout(lines);
  const body = { items: lines, budgetLkr: 30, quoteFingerprint: quote.fingerprint, idempotencyKey: key };
  await POST(request(body), undefined);
  const firstData = db.bag.create.mock.calls[0][0].data;
  db.bag.findUnique.mockResolvedValue(fakeBag(firstData));
  expect((await POST(request(body), undefined)).status).toBe(200);
  expect((await POST(request({ ...body, budgetLkr: 31 }), undefined)).status).toBe(409);
  expect(db.bag.create).toHaveBeenCalledTimes(1);
});

it('refuses malformed or unauthenticated approval requests', async () => {
  expect((await POST(request({ items: lines, budgetLkr: 30, quoteFingerprint: 'abc',
    idempotencyKey: key }), undefined)).status).toBe(400);
  expect((await POST(request({ items: lines }, ''), undefined)).status).toBe(401);
  expect(db.bag.create).not.toHaveBeenCalled();
});
