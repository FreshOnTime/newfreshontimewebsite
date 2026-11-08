import type { NextRequest } from 'next/server';

const mockPrisma = {
  product: { findFirst: jest.fn(), findMany: jest.fn() },
  category: { findMany: jest.fn() },
  subscriptionPlan: { findMany: jest.fn() },
  bag: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
  bagItem: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() },
  wishlistItem: { findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() },
  order: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  $transaction: jest.fn(),
};
const mockAuthenticate = jest.fn();
const mockQuote = jest.fn();
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: mockPrisma }));
jest.mock('@/lib/mcp/agentAuth', () => ({ authenticateMcpAgent: (...args: unknown[]) => mockAuthenticate(...args) }));
jest.mock('@/lib/checkoutService', () => ({ prepareCheckout: (...args: unknown[]) => mockQuote(...args) }));

import { POST } from '@/app/api/mcp/route';

const id = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
let sequence = 1;
const product = { id: 'p1', sku: 'tomato', slug: 'tomato', name: 'Tomatoes', price: 100, discountPercentage: 10, stockQty: 5, archived: false,
  description: 'Tomatoes', image: '/tomato.jpg', images: [], isBundle: false, category: { name: 'Produce', slug: 'produce' } };
function bag(owner = 'customer-1') {
  return { id, userId: owner, name: 'Weekly groceries', description: null, tags: [], isActive: true, createdAt: new Date(),
    updatedAt: new Date(), items: [{ id: 'line1', bagId: id, productId: 'p1', quantity: 2, price: 90, product }] };
}
function request(method: string, params: Record<string, unknown> = {}, auth = true) {
  return new Request('https://freshpick.lk/api/mcp', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-11-25', ...(auth ? { Authorization: 'Bearer fp_agent_' + 'a'.repeat(64) } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: sequence++, method, params }),
  }) as NextRequest;
}
async function tools(auth = true) {
  const response = await POST(request('tools/list', {}, auth));
  return { response, body: await response.json() };
}
async function tool(name: string, args: Record<string, unknown> = {}) {
  const response = await POST(request('tools/call', { name, arguments: args }));
  return { response, body: await response.json() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthenticate.mockResolvedValue({ userId: 'customer-1', scopes: ['catalog:read', 'bags:read', 'bags:write', 'wishlist:read', 'wishlist:write', 'orders:read'] });
  mockPrisma.bag.findFirst.mockResolvedValue(bag());
  mockPrisma.bag.findMany.mockResolvedValue([bag()]);
  mockPrisma.bag.update.mockResolvedValue(bag());
  mockPrisma.bag.updateMany.mockResolvedValue({ count: 1 });
  mockPrisma.bagItem.findMany.mockResolvedValue([{ price: 90, quantity: 2 }]);
  mockPrisma.bagItem.findUnique.mockResolvedValue({ quantity: 2 });
  mockPrisma.product.findFirst.mockResolvedValue(product);
  mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ id }]),
    product: mockPrisma.product, bagItem: mockPrisma.bagItem, bag: mockPrisma.bag,
  }));
  mockQuote.mockResolvedValue({ quote: { items: [{ name: 'Tomatoes', price: 90, quantity: 2, total: 180 }], subtotal: 180, shipping: 0, tax: 0, total: 180, fingerprint: 'abc' } });
});

it('keeps anonymous MCP limited to the public read-only catalog and subscription plan tools', async () => {
  const { body } = await tools(false);
  expect(body.result.tools.map((t: { name: string }) => t.name).sort()).toEqual(['get_product', 'list_categories', 'list_subscription_plans', 'search_products']);
  expect(mockAuthenticate).not.toHaveBeenCalled();
});

it('returns subscription plan checkout links but does not subscribe the customer', async () => {
  mockPrisma.subscriptionPlan.findMany.mockResolvedValue([{
    id: 'plan-1', name: 'Weekly vegetables', slug: 'weekly-veggies',
    description: 'Seasonal produce', shortDescription: 'Vegetable box',
    price: 1800, frequency: 'weekly', features: ['Fresh vegetables'],
    maxSubscribers: null, currentSubscribers: 0,
  }]);
  const { body } = await tool('list_subscription_plans');
  const plan = body.result.structuredContent.plans[0];
  expect(plan.checkoutUrl).toBe('https://freshpick.lk/checkout?plan=weekly-veggies');
  expect(plan.subscriptionCreated).toBe(false);
  expect(plan.requiresCustomerAction).toBe(true);
});

it('rejects an invalid agent credential without exposing account tools', async () => {
  mockAuthenticate.mockResolvedValue(null);
  const { response, body } = await tools();
  expect(response.status).toBe(401);
  expect(body.error.message).toMatch(/Invalid or expired/);
  expect(mockPrisma.bag.findMany).not.toHaveBeenCalled();
});

it('exposes bag and wishlist tools to authorized agents but never creates a checkout tool', async () => {
  const { body } = await tools();
  const names = body.result.tools.map((t: { name: string }) => t.name);
  expect(names).toEqual(expect.arrayContaining(['create_bag', 'add_to_bag', 'set_bag_item_quantity', 'get_checkout_handoff',
    'list_my_bags', 'prepare_reorder_bag', 'add_to_wishlist', 'list_my_orders']));
  expect(names).not.toContain('checkout');
  expect(names).not.toContain('place_order');
  expect(names).not.toContain('pay');
});

it('cannot read another customer’s bag', async () => {
  mockPrisma.bag.findFirst.mockResolvedValue(null);
  const { body } = await tool('get_my_bag', { bagId: otherId });
  expect(mockPrisma.bag.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: otherId, userId: 'customer-1', isActive: true } }));
  expect(body.result.isError).toBe(true);
});

it('adds quantities under the row lock, with customer ownership and sale prices', async () => {
  const { body } = await tool('add_to_bag', { bagId: id, productId: 'tomato', quantity: 2 });
  expect(body.result.isError).not.toBe(true);
  expect(mockPrisma.$transaction).toHaveBeenCalled();
  expect(mockPrisma.bagItem.upsert).toHaveBeenCalledWith(expect.objectContaining({
    update: { quantity: { increment: 2 }, price: 90 },
  }));
});

it('rejects additions exceeding stock', async () => {
  const { body } = await tool('add_to_bag', { bagId: id, productId: 'tomato', quantity: 4 });
  expect(body.result.isError).toBe(true);
  expect(mockPrisma.bagItem.upsert).not.toHaveBeenCalled();
});

it('quotes and hands off checkout without creating an order or payment', async () => {
  const { body } = await tool('get_checkout_handoff', { bagId: id });
  expect(body.result.structuredContent.checkoutUrl).toBe('https://freshpick.lk/checkout?bagId=' + id);
  expect(body.result.structuredContent.requiresCustomerAction).toBe(true);
  expect(body.result.structuredContent.orderPlaced).toBe(false);
  expect(mockQuote).toHaveBeenCalledWith([{ productId: 'p1', quantity: 2 }]);
  expect(mockPrisma.order.create).not.toHaveBeenCalled();
});

it('scopes bag deletion to the authorized customer', async () => {
  await tool('delete_bag', { bagId: id });
  expect(mockPrisma.bag.updateMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { id, userId: 'customer-1', isActive: true }, data: { isActive: false },
  }));
});
