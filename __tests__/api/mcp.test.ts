import type { NextRequest } from 'next/server';

const mockPrisma = { product: { findMany: jest.fn(), findFirst: jest.fn() }, category: { findMany: jest.fn() } };
const mockRecipes = { listPublishedRecipes: jest.fn(), getPublishedRecipeBySlug: jest.fn() };
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: mockPrisma }));
jest.mock('@/lib/recipeService', () => mockRecipes);

import { POST, GET, DELETE, OPTIONS } from '@/app/api/mcp/route';

const product = { id: 'p1', sku: 'tomato', name: 'Tomatoes', description: 'Fresh tomatoes', price: 350, discountPercentage: 15, stockQty: 2, image: '/tomato.jpg', images: [], isBundle: false, category: { name: 'Produce', slug: 'produce' }, costPrice: 120, supplierId: 'private-supplier' };
let nextId = 1;
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://freshpick.lk/api/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-11-25', ...headers }, body: JSON.stringify(body) }) as NextRequest;
}
async function rpc(method: string, params: Record<string, unknown> = {}) {
  const response = await POST(request({ jsonrpc: '2.0', id: nextId++, method, params }));
  return { response, body: await response.json() };
}
async function tool(name: string, args: Record<string, unknown> = {}) {
  return rpc('tools/call', { name, arguments: args });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.product.findMany.mockResolvedValue([product]);
  mockPrisma.product.findFirst.mockResolvedValue(product);
  mockPrisma.category.findMany.mockResolvedValue([]);
  mockRecipes.listPublishedRecipes.mockResolvedValue([]);
  mockRecipes.getPublishedRecipeBySlug.mockResolvedValue(null);
});

describe('FreshPick MCP protocol and public data boundaries', () => {
  it('initializes, accepts initialized notifications and lists only five read tools', async () => {
    const init = await rpc('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test-client', version: '1.0' } });
    expect(init.response.status).toBe(200);
    expect(init.body.result.serverInfo.name).toBe('freshpick');
    expect(init.response.headers.has('MCP-Session-Id')).toBe(false);
    const notification = await POST(request({ jsonrpc: '2.0', method: 'notifications/initialized' }));
    expect(notification.status).toBe(202);
    const listed = await rpc('tools/list');
    expect(listed.body.result.tools.map((t: { name: string }) => t.name).sort()).toEqual(['get_product', 'get_recipe', 'list_categories', 'list_recipes', 'search_products']);
    expect(listed.body.result.tools.every((t: { annotations: { readOnlyHint: boolean; destructiveHint: boolean } }) => t.annotations.readOnlyHint && !t.annotations.destructiveHint)).toBe(true);
  });

  it('filters searches to public products and returns sale prices without admin fields', async () => {
    mockPrisma.product.findMany.mockResolvedValue([product, { ...product, id: 'p2' }]);
    const called = await tool('search_products', { query: 'tomato', categorySlug: 'produce', inStockOnly: true, limit: 1, archived: true });
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ archived: false, category: { slug: 'produce', isActive: true }, stockQty: { gt: 0 } }), take: 2, skip: 0 }));
    const data = called.body.result.structuredContent;
    expect(data.products).toHaveLength(1);
    expect(data.hasNext).toBe(true);
    expect(data.products[0]).toMatchObject({ price: 297.5, currency: 'LKR', inStock: true, path: '/products/tomato' });
    expect(JSON.stringify(data)).not.toMatch(/costPrice|private-supplier|supplierId/);
    expect(mockPrisma.product.findMany.mock.calls[0][0].select.costPrice).toBeUndefined();
  });

  it('rejects oversized tool queries and pagination before querying the database', async () => {
    for (const args of [{ limit: 21 }, { page: 101 }, { query: 'x'.repeat(121) }]) {
      const called = await tool('search_products', args);
      expect(called.body.result?.isError || called.body.error).toBeTruthy();
    }
    expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
  });

  it('requires non-archived products and returns a missing product as a tool error', async () => {
    mockPrisma.product.findFirst.mockResolvedValue(null);
    const called = await tool('get_product', { sku: 'archived-product' });
    expect(mockPrisma.product.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { sku: 'archived-product', archived: false } }));
    expect(called.body.result.isError).toBe(true);
  });

  it('lists active categories with a bounded query', async () => {
    await tool('list_categories');
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true }, take: 100 }));
  });

  it('uses published recipes and removes internal author identifiers', async () => {
    const recipe = { title: 'Salad', slug: 'salad', authorId: 'internal-author', authorName: 'Nisha', excerpt: 'Make a salad', prepTimeMinutes: 10, cookTimeMinutes: 0, servings: 2, dietaryTags: [], ingredientCount: 1, story: 'A simple salad', steps: ['Mix'], ingredients: [{ productId: 'p1', quantity: 1, product: { sku: 'tomato', name: 'Tomatoes', isOutOfStock: false }, substitutions: [] }] };
    mockRecipes.listPublishedRecipes.mockResolvedValue([recipe]);
    mockRecipes.getPublishedRecipeBySlug.mockResolvedValue(recipe);
    const listed = await tool('list_recipes', { limit: 3 });
    const detail = await tool('get_recipe', { slug: 'salad' });
    expect(mockRecipes.listPublishedRecipes).toHaveBeenCalledWith(3);
    expect(mockRecipes.getPublishedRecipeBySlug).toHaveBeenCalledWith('salad');
    expect(JSON.stringify([listed.body, detail.body])).not.toContain('internal-author');
    expect(detail.body.result.structuredContent.recipe.ingredients[0].product.path).toBe('/products/tomato');
  });

  it('does not provide unpublished recipes or mutation tools', async () => {
    expect((await tool('get_recipe', { slug: 'draft' })).body.result.isError).toBe(true);
    const called = await tool('delete_product', { sku: 'tomato' });
    expect(called.body.error || called.body.result?.isError).toBeTruthy();
    expect(mockPrisma.product.findFirst).not.toHaveBeenCalled();
  });

  it('returns a generic failure without database connection details', async () => {
    mockPrisma.product.findMany.mockRejectedValue(new Error('secret postgres connection password'));
    const called = await tool('search_products');
    expect(called.body.result.isError).toBe(true);
    expect(JSON.stringify(called.body)).not.toContain('secret');
  });

  it('rejects unexpected hosts and browser origins on every supported method', async () => {
    for (const handler of [GET, DELETE, OPTIONS]) {
      expect((await handler(new Request('https://freshpick.lk/api/mcp', { headers: { Origin: 'https://attacker.example' } }))).status).toBe(403);
    }
    expect((await POST(request({ jsonrpc: '2.0', id: nextId++, method: 'tools/list' }, { Host: 'attacker.example' }))).status).toBe(403);
    expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
  });

  it('allows the site origin, sends no-cache headers and declines standalone SSE', async () => {
    const options = await OPTIONS(new Request('https://freshpick.lk/api/mcp', { headers: { Origin: 'https://freshpick.lk' } }));
    expect(options.status).toBe(204);
    expect(options.headers.get('Access-Control-Allow-Origin')).toBe('https://freshpick.lk');
    expect((await GET(new Request('https://freshpick.lk/api/mcp'))).status).toBe(405);
    expect((await rpc('tools/list')).response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects malformed and oversized JSON-RPC bodies', async () => {
    const bad = new Request('https://freshpick.lk/api/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: '{invalid' });
    expect((await POST(bad as NextRequest)).status).toBe(400);
    expect((await POST(request({ jsonrpc: '2.0', id: nextId++, method: 'tools/call', params: { value: 'x'.repeat(70000) } }))).status).toBe(413);
    expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
  });

  it('limits repeated protocol requests and supplies a retry time', async () => {
    let response: Response | undefined;
    for (let i = 0; i < 61; i++) response = await POST(request({ jsonrpc: '2.0', id: nextId++, method: 'ping' }, { 'x-nf-client-connection-ip': 'mcp-rate-test-client' }));
    expect(response?.status).toBe(429);
    expect(Number(response?.headers.get('Retry-After'))).toBeGreaterThan(0);
  });
});
