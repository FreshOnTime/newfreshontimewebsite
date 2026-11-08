import 'server-only';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { BAG_INCLUDE, bagTotal, serializeBag } from '@/lib/bagSerializer';
import { productUnitPrice } from '@/lib/commercePricing';
import { prepareCheckout } from '@/lib/checkoutService';
import { oauthChallenge, oauthProvider } from '@/lib/mcp/oauth';

const read = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const add = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const replace = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const remove = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };
const ref = z.string().trim().min(1).max(200);
const bagId = z.string().uuid();
const qty = z.number().int().min(1).max(10000);
const bagName = z.string().trim().min(1).max(120);
class ShoppingError extends Error {}

async function reply(fn: () => Promise<Record<string, unknown>>): Promise<CallToolResult> {
  try {
    const data = await fn();
    return { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data };
  } catch (error) {
    const message = error instanceof ShoppingError ? error.message : 'FreshPick could not complete this request. Please retry or use the website.';
    return { isError: true, content: [{ type: 'text', text: message }] };
  }
}

function absolute(origin: string, path: string) { return new URL(path, origin).toString(); }

async function ownedBag(userId: string, id: string) {
  const bag = await prisma.bag.findFirst({ where: { id, userId, isActive: true }, include: BAG_INCLUDE });
  if (!bag) throw new ShoppingError('Shopping bag not found.');
  return bag;
}

async function lookupProduct(tx: Prisma.TransactionClient, productId: string, allowArchived = false) {
  return tx.product.findFirst({
    where: { ...(allowArchived ? {} : { archived: false }), OR: [{ id: productId }, { sku: productId }, { slug: productId }] },
  });
}

/** Same row locking, stock bounds and sale-price arithmetic as the normal shopping API. */
async function editItem(userId: string, id: string, productId: string, quantity: number, mode: 'add' | 'set') {
  return prisma.$transaction(async (tx) => {
    // This is a constant SQL string with positional, parameter-bound values.
    const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      'SELECT id FROM bags WHERE id = $1 AND "userId" = $2 AND "isActive" = true FOR UPDATE', id, userId,
    );
    if (!rows.length) throw new ShoppingError('Shopping bag not found.');
    const product = await lookupProduct(tx, productId, mode === 'set' && quantity === 0);
    if (!product) throw new ShoppingError('Product not found.');
    const key = { bagId_productId: { bagId: id, productId: product.id } };
    if (mode === 'set' && quantity === 0) {
      await tx.bagItem.deleteMany({ where: { bagId: id, productId: product.id } });
    } else {
      const old = mode === 'add' ? await tx.bagItem.findUnique({ where: key, select: { quantity: true } }) : null;
      const next = mode === 'add' ? (old?.quantity || 0) + quantity : quantity;
      if (next > 10000 || next > product.stockQty) throw new ShoppingError('Insufficient stock for requested quantity.');
      const price = productUnitPrice(product);
      await tx.bagItem.upsert({
        where: key,
        update: mode === 'add' ? { quantity: { increment: quantity }, price } : { quantity: next, price },
        create: { bagId: id, productId: product.id, quantity: next, price },
      });
    }
    const items = await tx.bagItem.findMany({ where: { bagId: id }, select: { price: true, quantity: true } });
    const bag = await tx.bag.update({
      where: { id }, data: { totalAmount: bagTotal(items.map(i => ({ price: Number(i.price), quantity: i.quantity }))) },
      include: BAG_INCLUDE,
    });
    return serializeBag(bag);
  });
}

export function registerShoppingTools(server: McpServer, userId: string, origin: string, grantedScopes: string[] = []) {
  const allowed = new Set(grantedScopes);
  const toolMetadata = (scope: string | string[]) => oauthProvider()
    ? { _meta: { securitySchemes: [{ type: 'oauth2' as const, scopes: Array.isArray(scope) ? scope : [scope] }] } }
    : {};
  const protectedReply = (scope: string | string[], fn: () => Promise<Record<string, unknown>>): Promise<CallToolResult> => {
    const required = Array.isArray(scope) ? scope : [scope];
    if (userId && required.every(s => allowed.has(s))) return reply(fn);
    const provider = oauthProvider();
    return Promise.resolve({
      isError: true,
      content: [{ type: 'text', text: 'Connect your FreshPick account to use this shopping tool.' }],
      ...(provider ? { _meta: { 'mcp/www_authenticate': [oauthChallenge(provider, required.join(' '))] } } : {}),
    });
  };

  server.registerTool('list_my_bags', {
    title: 'List my FreshPick shopping bags', description: 'Show the connected customer their active bags and current prices.',
    inputSchema: {}, annotations: read, ...toolMetadata('bags:read'),
  }, async () => protectedReply('bags:read', async () => ({
    bags: (await prisma.bag.findMany({ where: { userId, isActive: true }, include: BAG_INCLUDE, orderBy: { createdAt: 'desc' }, take: 50 })).map(serializeBag),
  })));

  server.registerTool('get_my_bag', {
    title: 'Read my FreshPick bag', description: 'Show items and current prices in my own shopping bag.',
    inputSchema: { bagId }, annotations: read, ...toolMetadata('bags:read'),
  }, async ({ bagId: id }) => protectedReply('bags:read', async () => ({ bag: serializeBag(await ownedBag(userId, id)) })));

  server.registerTool('create_bag', {
    title: 'Create a shopping bag',
    description: 'Create a saved bag with optional products. Does not purchase, reserve stock, or trigger payment.',
    inputSchema: {
      name: bagName, description: z.string().trim().max(1000).optional(),
      tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
      items: z.array(z.object({ productId: ref, quantity: qty })).max(100).default([]),
    }, annotations: add, ...toolMetadata('bags:write'),
  }, async ({ name, description, tags, items }) => protectedReply('bags:write', async () => {
    const merged = new Map<string, { productId: string; quantity: number; price: number }>();
    for (const item of items) {
      const product = await prisma.product.findFirst({ where: { archived: false, OR: [{ id: item.productId }, { sku: item.productId }, { slug: item.productId }] } });
      if (!product) throw new ShoppingError('A requested product is unavailable.');
      const next = (merged.get(product.id)?.quantity || 0) + item.quantity;
      if (next > 10000 || next > product.stockQty) throw new ShoppingError('Insufficient stock for ' + product.name + '.');
      merged.set(product.id, { productId: product.id, quantity: next, price: productUnitPrice(product) });
    }
    const lines = [...merged.values()];
    const bag = await prisma.bag.create({ data: {
      userId, name, description: description || null, tags, totalAmount: bagTotal(lines),
      items: { create: lines },
    }, include: BAG_INCLUDE });
    return { bag: serializeBag(bag), bagUrl: absolute(origin, '/bags/' + encodeURIComponent(bag.id)) };
  }));

  server.registerTool('add_to_bag', {
    title: 'Add a product to my bag',
    description: 'Increment the quantity of a product in a bag I own; verifies stock and current price.',
    inputSchema: { bagId, productId: ref, quantity: qty }, annotations: add, ...toolMetadata('bags:write'),
  }, async ({ bagId: id, productId, quantity }) => protectedReply('bags:write', async () => ({ bag: await editItem(userId, id, productId, quantity, 'add') })));

  server.registerTool('set_bag_item_quantity', {
    title: 'Set or remove a bag item',
    description: 'Set the exact quantity, or zero to remove; validates stock and ownership.',
    inputSchema: { bagId, productId: ref, quantity: z.number().int().min(0).max(10000) }, annotations: replace, ...toolMetadata('bags:write'),
  }, async ({ bagId: id, productId, quantity }) => protectedReply('bags:write', async () => ({ bag: await editItem(userId, id, productId, quantity, 'set') })));

  server.registerTool('update_bag_details', {
    title: 'Update a saved bag', description: 'Rename my bag or change its description and labels.',
    inputSchema: { bagId, name: bagName.optional(), description: z.string().trim().max(1000).optional(),
      tags: z.array(z.string().trim().min(1).max(60)).max(20).optional() }, annotations: replace, ...toolMetadata('bags:write'),
  }, async ({ bagId: id, name, description, tags }) => protectedReply('bags:write', async () => {
    if (name === undefined && description === undefined && tags === undefined) throw new ShoppingError('Specify a detail to update.');
    const updated = await prisma.bag.updateMany({ where: { id, userId, isActive: true }, data: { name, description, tags } });
    if (!updated.count) throw new ShoppingError('Shopping bag not found.');
    return { bag: serializeBag(await ownedBag(userId, id)) };
  }));

  server.registerTool('delete_bag', {
    title: 'Remove a saved bag', description: 'Soft-delete one of my own bags.',
    inputSchema: { bagId }, annotations: remove, ...toolMetadata('bags:write'),
  }, async ({ bagId: id }) => protectedReply('bags:write', async () => {
    const deleted = await prisma.bag.updateMany({ where: { id, userId, isActive: true }, data: { isActive: false } });
    if (!deleted.count) throw new ShoppingError('Shopping bag not found.');
    return { deleted: true, bagId: id };
  }));

  server.registerTool('get_checkout_handoff', {
    title: 'Hand shopping bag to the customer',
    description: 'Return an updated quote and a checkout URL. Never submits an order, reserves items or handles payment. The human customer must complete checkout.',
    inputSchema: { bagId }, annotations: read, ...toolMetadata('bags:read'),
  }, async ({ bagId: id }) => protectedReply('bags:read', async () => {
    const bag = await ownedBag(userId, id);
    if (!bag.items.length) throw new ShoppingError('Add groceries to the bag first.');
    const { quote } = await prepareCheckout(bag.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
    return {
      bagId: id, bagName: bag.name, quote, currency: 'LKR',
      checkoutUrl: absolute(origin, '/checkout?bagId=' + encodeURIComponent(id)),
      requiresCustomerAction: true, orderPlaced: false,
      message: 'The bag is ready. Open this link, check current prices and delivery details, and complete checkout yourself. No order was placed.',
    };
  }));

  server.registerTool('list_my_wishlist', {
    title: 'View my wishlist', description: 'Read only the connected customer’s saved products.',
    inputSchema: {}, annotations: read, ...toolMetadata('wishlist:read'),
  }, async () => protectedReply('wishlist:read', async () => {
    const rows = await prisma.wishlistItem.findMany({ where: { userId },
      include: { product: { select: { id: true, sku: true, name: true, price: true, discountPercentage: true, stockQty: true, archived: true } } },
      orderBy: { createdAt: 'desc' }, take: 100 });
    return { products: rows.map(({ product: p }) => ({
      id: p.id, sku: p.sku, name: p.name, price: productUnitPrice(p), currency: 'LKR', inStock: !p.archived && p.stockQty > 0,
    })) };
  }));

  server.registerTool('add_to_wishlist', {
    title: 'Save a grocery to wishlist', description: 'Save a catalogue product for this customer.',
    inputSchema: { productId: ref }, annotations: replace, ...toolMetadata('wishlist:write'),
  }, async ({ productId }) => protectedReply('wishlist:write', async () => {
    const product = await prisma.product.findFirst({ where: { archived: false, OR: [{ id: productId }, { sku: productId }, { slug: productId }] }, select: { id: true } });
    if (!product) throw new ShoppingError('Product not found.');
    await prisma.wishlistItem.upsert({ where: { userId_productId: { userId, productId: product.id } }, update: {}, create: { userId, productId: product.id } });
    return { saved: true, productId: product.id };
  }));

  server.registerTool('remove_from_wishlist', {
    title: 'Remove a wishlist product', description: 'Remove a product from this customer’s wishlist.',
    inputSchema: { productId: ref }, annotations: remove, ...toolMetadata('wishlist:write'),
  }, async ({ productId }) => protectedReply('wishlist:write', async () => {
    const product = await prisma.product.findFirst({ where: { OR: [{ id: productId }, { sku: productId }, { slug: productId }] }, select: { id: true } });
    if (!product) return { removed: false };
    const result = await prisma.wishlistItem.deleteMany({ where: { userId, productId: product.id } });
    return { removed: result.count > 0 };
  }));

  server.registerTool('list_my_orders', {
    title: 'Read my order history', description: 'Read order summaries for the connected customer; no order modification or checkout.',
    inputSchema: { limit: z.number().int().min(1).max(20).default(10) }, annotations: read, ...toolMetadata('orders:read'),
  }, async ({ limit }) => protectedReply('orders:read', async () => ({
    orders: (await prisma.order.findMany({ where: { customerId: userId },
      select: { id: true, orderNumber: true, createdAt: true, status: true, total: true, bagName: true },
      orderBy: { createdAt: 'desc' }, take: limit,
    })).map(order => ({ ...order, total: Number(order.total), currency: 'LKR' })),
  })));

  server.registerTool('prepare_reorder_bag', {
    title: 'Build a bag from my previous order',
    description: 'Prepare a fresh shopping bag with new stock and price checks from a previous order. Never purchases.',
    inputSchema: { orderId: z.string().uuid() }, annotations: add, ...toolMetadata(['bags:write', 'orders:read']),
  }, async ({ orderId }) => protectedReply(['bags:write', 'orders:read'], async () => {
    const order = await prisma.order.findFirst({ where: { id: orderId, customerId: userId }, include: { items: true } });
    if (!order) throw new ShoppingError('Order not found.');
    if (!order.items.length || order.items.length > 100) throw new ShoppingError('This order cannot be reused.');
    const merged = new Map<string, { productId: string; quantity: number; price: number }>();
    for (const item of order.items) {
      const product = await prisma.product.findFirst({ where: { id: item.productId, archived: false } });
      const count = (merged.get(item.productId)?.quantity || 0) + item.qty;
      if (!product || count > product.stockQty || count > 10000 || count < 1) throw new ShoppingError('Some products are out of stock. Create a new bag instead.');
      merged.set(product.id, { productId: product.id, quantity: count, price: productUnitPrice(product) });
    }
    const lines = [...merged.values()];
    const bag = await prisma.bag.create({ data: { userId, name: 'Reorder from #' + order.orderNumber,
      tags: ['reorder'], totalAmount: bagTotal(lines), items: { create: lines } }, include: BAG_INCLUDE });
    return { bag: serializeBag(bag), checkoutUrl: absolute(origin, '/checkout?bagId=' + encodeURIComponent(bag.id)),
      requiresCustomerAction: true, orderPlaced: false };
  }));
}
