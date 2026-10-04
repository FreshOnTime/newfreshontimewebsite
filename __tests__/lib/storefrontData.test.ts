import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { loadStorefrontHome, loadActiveSubscriptionPlans } from '@/lib/storefrontData';

jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  product: { findMany: jest.fn() }, category: { findMany: jest.fn() },
  subscriptionPlan: { findMany: jest.fn() },
} }));
jest.mock('@/lib/productSerializer', () => ({
  productCardSelect: { id: true }, serializeProductCardForUi: (p: { id: string }) => ({ _id: p.id }),
}));

beforeEach(() => jest.clearAllMocks());

test('homepage loads public products and active categories directly with display IDs', async () => {
  (prisma.product.findMany as jest.Mock).mockResolvedValue([{ id: 'product-1' }]);
  (prisma.category.findMany as jest.Mock).mockResolvedValue([{ id: 'cat-1', name: 'Fruit', slug: 'fruit', description: null, imageUrl: null }]);
  const data = await loadStorefrontHome();
  expect(data.products).toEqual([{ _id: 'product-1' }]);
  expect(data.categories).toEqual([{ _id: 'cat-1', name: 'Fruit', slug: 'fruit', description: undefined, imageUrl: undefined }]);
  expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { archived: false }, take: 12 }));
  expect(prisma.category.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }));
});

test('active plans preserve contents and serialize decimal prices for clients', async () => {
  (prisma.subscriptionPlan.findMany as jest.Mock).mockResolvedValue([
    { id: 'plan-1', name: 'Weekly', price: new Prisma.Decimal('1250.50'), originalPrice: new Prisma.Decimal('1500'), contents: [{ name: 'Fruit', quantity: '1', category: 'Fruit' }] },
  ]);
  const plans = await loadActiveSubscriptionPlans();
  expect(plans[0]).toMatchObject({ _id: 'plan-1', price: 1250.5, originalPrice: 1500, contents: [{ name: 'Fruit' }] });
  expect(prisma.subscriptionPlan.findMany).toHaveBeenCalledWith({ where: { isActive: true }, orderBy: { price: 'asc' }, include: { contents: true } });
});

test('database failures reject instead of becoming cacheable empty catalogues', async () => {
  (prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('offline'));
  (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.subscriptionPlan.findMany as jest.Mock).mockRejectedValue(new Error('offline'));
  await expect(loadStorefrontHome()).rejects.toThrow('offline');
  await expect(loadActiveSubscriptionPlans()).rejects.toThrow('offline');
});
