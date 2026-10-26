import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { POST } from '@/app/api/intelligence/me/route';
import { getSmartBasket } from '@/lib/intelligence/tasteGraph';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/intelligence/tasteGraph', () => ({
  getSmartBasket: jest.fn(),
  getIntelligenceOverview: jest.fn(),
}));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  bag: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
  product: { findMany: jest.fn() },
  $transaction: jest.fn(),
} }));

const db = prisma as unknown as {
  bag: { findFirst: jest.Mock; create: jest.Mock; findUnique: jest.Mock };
  product: { findMany: jest.Mock };
  $transaction: jest.Mock;
};
const tx = {
  $queryRaw: jest.fn(),
  bagItem: { findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
  bag: { update: jest.fn() },
};
const request = () => ({ user: { userId: 'customer-1' },
  json: async () => ({ productIds: ['tomato'] }) }) as unknown as NextRequest;

beforeEach(() => {
  jest.clearAllMocks();
  (getSmartBasket as jest.Mock).mockResolvedValue([{ product: { _id: 'tomato' } }]);
  db.bag.findFirst.mockResolvedValue({ id: 'bag-1' });
  db.bag.findUnique.mockResolvedValue(null);
  db.product.findMany.mockResolvedValue([{ id: 'tomato', price: 100,
    discountPercentage: 25, stockQty: 10 }]);
  tx.$queryRaw.mockResolvedValue([{ id: 'bag-1' }]);
  tx.bagItem.findUnique.mockResolvedValue(null);
  tx.bagItem.findMany.mockResolvedValue([{ price: 75, quantity: 1 }]);
  db.$transaction.mockImplementation((fn: (tx: typeof tx) => unknown) => fn(tx));
});

it.each([null, { quantity: 1 }])('saves discounted unit prices for both new and existing smart basket entries', async (existing) => {
  tx.bagItem.findUnique.mockResolvedValue(existing);
  const response = await POST(request(), undefined);
  expect(response.status).toBe(200);
  const mutation = tx.bagItem.upsert.mock.calls[0][0];
  expect(mutation.create.price).toBe(75);
  expect(mutation.update.price).toBe(75);
  expect(mutation.update.quantity).toBe(existing ? 2 : 1);
  expect(tx.bag.update.mock.calls[0][0].data.totalAmount).toBe(75);
});
