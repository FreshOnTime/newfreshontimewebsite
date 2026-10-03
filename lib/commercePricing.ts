import { deliveryCharge } from '@/lib/deliveryPolicy';

/** Shared LKR arithmetic. Product promotions are applied once per base unit. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function discountedUnitPrice(basePrice: number, percentage = 0): number {
  if (!Number.isFinite(basePrice) || basePrice < 0) throw new Error('Invalid product price');
  const discount = Number.isFinite(percentage) ? Math.min(100, Math.max(0, percentage)) : 0;
  return roundMoney(basePrice * (1 - discount / 100));
}

export function productUnitPrice(product: { price: unknown; discountPercentage?: unknown }): number {
  return discountedUnitPrice(Number(product.price), Number(product.discountPercentage || 0));
}

export function basketTotals(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce((cents, item) => cents + Math.round(item.price * 100) * item.quantity, 0) / 100;
  const shipping = deliveryCharge(subtotal);
  const tax = 0;
  return { subtotal, shipping, tax, discount: 0, total: roundMoney(subtotal + shipping + tax) };
}

export type CheckoutQuote = ReturnType<typeof basketTotals> & {
  fingerprint: string;
  items: { productId: string; name: string; quantity: number; price: number; total: number }[];
};
