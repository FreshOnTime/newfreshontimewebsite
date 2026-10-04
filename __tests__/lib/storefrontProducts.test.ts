import prisma from '@/lib/prisma';
import { loadStorefrontProduct, loadStorefrontProducts } from '@/lib/storefrontProducts';
import { GET } from '@/app/api/storefront/products/[id]/route';
import type { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  product: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn() },
} }));
const product = {
  id: 'product-1', sku: 'SKU-1', slug: 'fruit-box', name: 'Fruit box', description: null,
  price: 1500, discountPercentage: 10, stockQty: 5, minStockLevel: 1,
  image: null, images: [], isFeatured: false, isBundle: true, archived: false,
  attributes: {}, categoryId: 'cat-1', category: { name: 'Fruit', slug: 'fruit' },
  createdAt: new Date(), updatedAt: new Date(),
};
beforeEach(() => jest.clearAllMocks());

test.each(['product-1', 'SKU-1', 'fruit-box'])('detail accepts ID, SKU or slug (%s) and serializes bundle data', async id => {
  (prisma.product.findFirst as jest.Mock).mockResolvedValue(product);
  const result = await loadStorefrontProduct(id);
  expect(result).toMatchObject({ _id: 'product-1', isBundle: true, pricePerBaseQuantity: 1500, category: { id: 'cat-1' } });
  expect(prisma.product.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { OR: [{ id }, { sku: id }, { slug: id }] } }));
});

test.each([null, { ...product, archived: true }])('missing or archived product is a genuine not-found', async row => {
  (prisma.product.findFirst as jest.Mock).mockResolvedValue(row);
  expect(await loadStorefrontProduct('missing')).toBeNull();
  expect((await GET({} as NextRequest, { params: Promise.resolve({ id: 'missing' }) })).status).toBe(404);
});

test('a database outage rejects in the page loader and returns HTTP 500 rather than 404 in the API', async () => {
  (prisma.product.findFirst as jest.Mock).mockRejectedValue(new Error('database offline'));
  await expect(loadStorefrontProduct('SKU-1')).rejects.toThrow('database offline');
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const response = await GET({} as NextRequest, { params: Promise.resolve({ id: 'SKU-1' }) });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Unable to load product' });
  } finally { log.mockRestore(); }
});

test('list failures reject instead of yielding a cacheable empty result', async () => {
  (prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('database offline'));
  (prisma.product.count as jest.Mock).mockResolvedValue(0);
  await expect(loadStorefrontProducts('categoryId=cat-1')).rejects.toThrow('database offline');
});

test('different filter strings produce isolated queries and pagination results', async () => {
  (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.product.count as jest.Mock).mockResolvedValue(0);
  const first = await loadStorefrontProducts('categoryId=cat-1&page=2&limit=3');
  await loadStorefrontProducts('categoryId=cat-2&limit=999&inStock=true');
  expect(first.pagination).toMatchObject({ page: 2, limit: 3, hasPrev: true });
  expect(prisma.product.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { archived: false, categoryId: 'cat-1' }, skip: 3, take: 4 }));
  expect(prisma.product.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: { archived: false, categoryId: 'cat-2', stockQty: { gt: 0 } }, skip: 0, take: 61 }));
});
