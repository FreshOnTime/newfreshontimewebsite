import { extractShoppingTerms, hasUnverifiableDietaryConstraint, proposeShoppingBag } from '@/lib/agents/shoppingPlan';

const product = (id: string, name: string, price: number, discountPercentage = 0, stockQty = 5) => ({
  id, sku: id, name, description: '', price, discountPercentage, stockQty,
});

it('extracts bounded search terms instead of broad shopping words', () => {
  expect(extractShoppingTerms('Please get tomatoes and rice for my family this week')).toEqual(['tomatoes', 'rice']);
  expect(extractShoppingTerms('groceries for the week')).toEqual([]);
});
it('rejects unverified allergy or exclusion promises before catalogue search', () => {
  expect(hasUnverifiableDietaryConstraint('I am allergic to peanuts')).toBe(true);
  expect(hasUnverifiableDietaryConstraint('gluten-free groceries')).toBe(true);
  expect(hasUnverifiableDietaryConstraint('tomatoes and rice')).toBe(false);
});
it('uses discounted LKR prices and includes delivery in the budget', () => {
  const draft = proposeShoppingBag([
    product('tomato', 'Tomatoes', 30, 50),
    product('rice', 'Rice', 60),
  ], ['tomatoes', 'rice'], 25, 6);
  expect(draft.items).toEqual([{ productId: 'tomato', sku: 'tomato', name: 'Tomatoes',
    quantity: 1, unitPrice: 15, lineTotal: 15 }]);
  expect(draft.estimatedTotal).toBe(20);
});
it('never recommends out of stock or unrelated products', () => {
  const draft = proposeShoppingBag([
    product('milk', 'Milk', 20, 0, 0),
    product('rice', 'Rice', 10),
  ], ['milk'], 100, 6);
  expect(draft.items).toHaveLength(0);
  expect(draft.matched).toBe(false);
});
it('keeps output bounded by maximum item count and budget', () => {
  const draft = proposeShoppingBag(
    Array.from({ length: 40 }, (_, i) => product(String(i), 'Fresh produce', 12)),
    [], 40, 3,
  );
  expect(draft.items).toHaveLength(2);
  expect(draft.estimatedTotal).toBe(29);
  expect(draft.estimatedTotal).toBeLessThanOrEqual(40);
});
