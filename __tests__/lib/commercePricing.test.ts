import { basketTotals, discountedUnitPrice } from '@/lib/commercePricing';
import { checkoutRetryForIntent, readCheckoutRetry } from '@/lib/checkoutRetry';
import { webcrypto } from 'crypto';
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
it('rounds sale units before multiplying quantities', () => {
  const price = discountedUnitPrice(19.99, 15);
  expect(price).toBe(16.99); expect(basketTotals([{ price, quantity: 3 }])).toEqual({ subtotal: 50.97, shipping: 0, tax: 0, discount: 0, total: 50.97 });
});
it('preserves the current inclusive delivery-fee boundary', () => {
  expect(basketTotals([{ price: 25, quantity: 2 }])).toMatchObject({ subtotal: 50, shipping: 5, total: 55 });
});
it('clamps malformed percentage promotions without negative prices', () => {
  expect(discountedUnitPrice(20, 150)).toBe(0); expect(discountedUnitPrice(20, -1)).toBe(20); expect(discountedUnitPrice(20, NaN)).toBe(20);
});
it('keeps the key and schedule timestamp across an uncertain retry, including reload', () => {
  const retry = checkoutRetryForIntent(null, 'a'.repeat(64));
  const recovered = readCheckoutRetry({ getItem: () => JSON.stringify(retry) }, 'scope');
  expect(checkoutRetryForIntent(recovered, 'a'.repeat(64))).toEqual(retry);
  expect(checkoutRetryForIntent(recovered, 'b'.repeat(64)).key).not.toBe(retry.key);
  expect(checkoutRetryForIntent({ ...retry, completed: true }, 'a'.repeat(64)).key).not.toBe(retry.key);
});
it('ignores corrupted storage records', () => {
  expect(readCheckoutRetry({ getItem: () => '{invalid' }, 'scope')).toBeNull();
  expect(readCheckoutRetry({ getItem: () => JSON.stringify({ key: 'bad', intentHash: 'bad', startedAt: 'bad' }) }, 'scope')).toBeNull();
});
