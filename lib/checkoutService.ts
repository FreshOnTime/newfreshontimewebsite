import { createHash } from 'crypto';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { basketTotals, productUnitPrice, roundMoney, type CheckoutQuote } from '@/lib/commercePricing';
import { orderAddressSchema } from '@/lib/orderAddress';

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export const checkoutItemsSchema = z.array(z.object({
  productId: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().int().min(1).max(10000),
})).min(1).max(100);

const deliveryDate = z.union([z.string().date(), z.string().datetime({ offset: true })]);

const recurrenceSchema = z.object({
  startDate: deliveryDate.optional(), endDate: deliveryDate.optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  includeDates: z.array(deliveryDate).max(366).optional(),
  excludeDates: z.array(deliveryDate).max(366).optional(),
  selectedDates: z.array(deliveryDate).max(366).optional(),
  rruleString: z.string().max(2000).optional(), notes: z.string().trim().max(1000).optional(),
});

export const checkoutSchema = z.object({
  items: checkoutItemsSchema,
  shippingAddress: orderAddressSchema.optional(),
  paymentMethod: z.enum(['cash', 'cash_on_delivery']).optional().default('cash'),
  notes: z.string().trim().max(1000).optional(),
  // No verified order-level promotion mechanism exists yet.
  discount: z.coerce.number().refine((value) => value === 0, 'Order discounts must be issued by the server').optional(),
  bagId: z.string().trim().min(1).max(100).optional(), bagName: z.string().trim().max(120).optional(),
  useRegisteredAddress: z.boolean().optional().default(true),
  isRecurring: z.boolean().optional().default(false), recurrence: recurrenceSchema.optional(),
  quoteFingerprint: z.string().regex(/^[a-f0-9]{64}$/).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function checkoutRequestHash(input: CheckoutInput): string {
  const { quoteFingerprint: _quote, ...intent } = input;
  void _quote;
  return createHash('sha256').update(JSON.stringify({ ...intent, items: [...intent.items].sort((a, b) => a.productId.localeCompare(b.productId)) })).digest('hex');
}

export async function prepareCheckout(items: z.infer<typeof checkoutItemsSchema>) {
  const products = await prisma.product.findMany({
    where: { archived: false, OR: items.flatMap((item) => [{ id: item.productId }, { sku: item.productId }, { slug: item.productId }]) },
    select: { id: true, sku: true, slug: true, name: true, price: true, discountPercentage: true, stockQty: true },
  });
  const quantities = new Map<string, number>();
  for (const item of items) {
    const product = products.find((product) => product.id === item.productId)
      || products.find((product) => product.sku === item.productId)
      || products.find((product) => product.slug === item.productId);
    if (!product) throw new CheckoutError('An item is no longer available. Review your bag.');
    quantities.set(product.id, (quantities.get(product.id) || 0) + item.quantity);
  }
  const validatedItems = [...quantities].sort(([a], [b]) => a.localeCompare(b)).map(([id, qty]) => {
    const product = products.find((product) => product.id === id)!;
    if (qty > 10000 || product.stockQty < qty) throw new CheckoutError(`Insufficient stock for ${product.name}`);
    const price = productUnitPrice(product);
    return { productId: id, sku: product.sku, name: product.name, qty, price, total: roundMoney(price * qty),
      basePrice: product.price, discountPercentage: product.discountPercentage };
  });
  const totals = basketTotals(validatedItems.map((item) => ({ price: item.price, quantity: item.qty })));
  const quoteItems = validatedItems.map((item) => ({ productId: item.productId, name: item.name, quantity: item.qty, price: item.price, total: item.total }));
  const fingerprint = createHash('sha256').update(JSON.stringify({ items: quoteItems, ...totals })).digest('hex');
  const quote: CheckoutQuote = { items: quoteItems, fingerprint, ...totals };
  return { validatedItems, quote };
}
