import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { POST } from '@/app/api/assistant/plan/route';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  product: { findMany: jest.fn() },
} }));
const db = prisma as unknown as { product: { findMany: jest.Mock } };
const product = { id: 'tomato', sku: 'TOMATO', slug: 'tomato', name: 'Tomatoes', description: 'Fresh tomatoes', price: 40,
  discountPercentage: 50, stockQty: 8 };
const request = (body: unknown) => ({ json: async () => body }) as NextRequest;

beforeEach(() => {
  jest.clearAllMocks();
  db.product.findMany.mockResolvedValue([product]);
});

it('returns a checkout-authoritative, in-budget, private quote from existing products', async () => {
  const res = await POST(request({ query: 'Fresh tomatoes', budgetLkr: 30, maxItems: 6 }), undefined);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.data.mode).toBe('catalogue-guided');
  expect(body.data.quote).toMatchObject({ subtotal: 20, shipping: 5, total: 25,
    items: [{ productId: 'tomato', quantity: 1, price: 20 }] });
  expect(body.data.items[0]).toMatchObject({ name: 'Tomatoes', unitPrice: 20 });
  expect(db.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ archived: false, stockQty: { gt: 0 } }), take: 120,
  }));
});

it('rejects invalid budgets, large requests and unverifiable exclusions without a database call', async () => {
  for (const payload of [
    { query: 'milk', budgetLkr: -1 },
    { query: 'x'.repeat(301), budgetLkr: 500 },
    { query: 'Need food', budgetLkr: 500, maxItems: 100 },
  ]) expect((await POST(request(payload), undefined)).status).toBe(400);
  expect((await POST(request({ query: 'I am allergic to peanuts', budgetLkr: 200 }), undefined)).status).toBe(422);
  expect(db.product.findMany).not.toHaveBeenCalled();
});
it('returns no draft rather than inventing products when the catalogue has no match', async () => {
  db.product.findMany.mockResolvedValue([]);
  const res = await POST(request({ query: 'dragon fruit', budgetLkr: 400 }), undefined);
  const body = await res.json();
  expect(body.data.items).toEqual([]);
  expect(body.data.quote).toBeNull();
});
it('does not issue any database mutation during planning', async () => {
  const res = await POST(request({ query: 'tomatoes', budgetLkr: 30 }), undefined);
  expect(res.status).toBe(200);
  expect(Object.keys(db.product)).toEqual(['findMany']);
});
