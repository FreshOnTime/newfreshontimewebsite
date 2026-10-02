import type { NextRequest } from 'next/server';
import { GET } from '@/app/api/storefront/products/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { product: { findMany: jest.fn(), count: jest.fn() } } }));
jest.mock('@/lib/productSerializer', () => ({ productCardSelect: { id: true, name: true }, serializeProductCardForUi: (product: unknown) => product }));

const findMany = prisma.product.findMany as jest.Mock;
const count = prisma.product.count as jest.Mock;
const request = (query: string) => ({ nextUrl: new URL('https://freshpick.lk/api/storefront/products?' + query) }) as NextRequest;

describe('Storefront catalogue pagination', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns the full filtered total, trims the lookahead row, and keeps ordering stable', async () => {
    findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    count.mockResolvedValue(31);
    const response = await GET(request('categoryId=produce&search=tomato&inStock=true&tags=Local&sort=price-asc&page=2&limit=2'));
    const body = await response.json();
    expect(body.products).toHaveLength(2);
    expect(body.pagination).toEqual({ page: 2, limit: 2, count: 2, total: 31, hasNext: true, hasPrev: true });
    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({ where: { archived: false, categoryId: 'produce', stockQty: { gt: 0 }, tags: { hasSome: ['Local'] } }, skip: 2, take: 3, orderBy: [{ price: 'asc' }, { id: 'asc' }] });
    expect(count).toHaveBeenCalledWith({ where: args.where });
  });

  it('reports an empty filtered result without inventing a next page', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    const response = await GET(request('maxPrice=0'));
    expect(await response.json()).toMatchObject({ products: [], pagination: { total: 0, count: 0, hasNext: false } });
    expect(findMany.mock.calls[0][0].where.price).toEqual({ lte: 0 });
  });

  it('signals catalogue outages rather than returning a successful empty selection', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      findMany.mockRejectedValue(new Error('database unavailable'));
      count.mockResolvedValue(0);
      const response = await GET(request(''));
      expect(response.status).toBe(500);
      expect(JSON.stringify(await response.json())).not.toContain('database unavailable');
    } finally { log.mockRestore(); }
  });
});
