import { productUnitPrice, roundMoney } from '@/lib/commercePricing';
import { deliveryPolicy } from '@/lib/deliveryPolicy';

// Deliberately deterministic: the initial guided assistant only recommends
// actual in-stock catalogue rows. It never invents products or issues writes.
export type ShoppingProduct = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: unknown;
  discountPercentage: unknown;
  stockQty: number;
};

export type DraftItem = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'around', 'basket', 'bag', 'buy', 'cheap', 'day',
  'days', 'essentials', 'family', 'find', 'food', 'for', 'fresh', 'get',
  'groceries', 'grocery', 'i', 'in', 'items', 'lkr', 'meal', 'meals', 'my',
  'need', 'of', 'on', 'people', 'please', 'rs', 'rupees', 'shop', 'shopping',
  'some', 'the', 'this', 'to', 'under', 'want', 'week', 'weekly', 'with',
]);
const RESTRICTED_DIET = /\b(allerg(?:y|ic|ies|en)|gluten[ -]?free|dairy[ -]?free|nut[ -]?free|without|exclude|avoid|intoleran(?:t|ce))\b/i;

// Dietary and allergy claims require verified ingredient data, not keyword
// inference. Refuse automated suggestions for these requests for now.
export function hasUnverifiableDietaryConstraint(query: string): boolean {
  return RESTRICTED_DIET.test(query);
}

export function extractShoppingTerms(query: string): string[] {
  const words = query.toLowerCase().match(/[\p{L}]{3,}/gu) || [];
  return [...new Set(words.filter((word) => !STOP_WORDS.has(word)))].slice(0, 8);
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFKC');
}

function scoreProduct(product: ShoppingProduct, terms: string[]) {
  if (!terms.length) return 1;
  const name = normalize(product.name);
  const sku = normalize(product.sku);
  const description = normalize(product.description || '');
  return terms.reduce((sum, term) =>
    sum + (name.includes(term) ? 6 : 0) + (sku.includes(term) ? 5 : 0) + (description.includes(term) ? 1 : 0), 0);
}

export function proposeShoppingBag(
  products: ShoppingProduct[],
  terms: string[],
  budgetLkr: number,
  maxItems: number,
): { items: DraftItem[]; estimatedSubtotal: number; estimatedTotal: number; matched: boolean } {
  const policy = deliveryPolicy();
  const ranked = products
    .filter((product) => product.stockQty > 0)
    .map((product) => ({ product, score: scoreProduct(product, terms), unitPrice: productUnitPrice(product) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.unitPrice - b.unitPrice || a.product.id.localeCompare(b.product.id));

  const items: DraftItem[] = [];
  let subtotalCents = 0;
  const budgetCents = Math.round(budgetLkr * 100);
  const priceAfterShipping = (cents: number) => {
    const subtotal = cents / 100;
    const shipping = policy.freeAbove !== null && subtotal > policy.freeAbove ? 0 : policy.fee;
    return cents + Math.round(shipping * 100);
  };

  for (const candidate of ranked) {
    if (items.length === maxItems) break;
    const itemCents = Math.round(candidate.unitPrice * 100);
    if (priceAfterShipping(subtotalCents + itemCents) > budgetCents) continue;
    subtotalCents += itemCents;
    items.push({
      productId: candidate.product.id,
      sku: candidate.product.sku,
      name: candidate.product.name,
      quantity: 1,
      unitPrice: candidate.unitPrice,
      lineTotal: candidate.unitPrice,
    });
  }

  const total = priceAfterShipping(subtotalCents) / 100;
  // An under-minimum order is not a viable checkout proposal.
  if (subtotalCents / 100 < policy.minimum) {
    return { items: [], estimatedSubtotal: 0, estimatedTotal: 0, matched: ranked.length > 0 };
  }
  return {
    items,
    estimatedSubtotal: roundMoney(subtotalCents / 100),
    estimatedTotal: roundMoney(total),
    matched: ranked.length > 0,
  };
}
