import { allocateBasketPrice } from '@/lib/basketPricing';
const item = (productId: string, qty: number, price: number) => ({ productId, sku: productId, name: productId, qty, price });
it('preserves the advertised price and stock quantities through rounding', () => {
  for (const total of [0.01, 1.01, 100.99, 9999999999.99]) {
    const rows = allocateBasketPrice(total, [item('a', 3, 20), item('b', 7, 40)]);
    expect(rows.reduce((sum,row) => sum + Math.round(row.total * 100),0)).toBe(Math.round(total * 100));
    expect(rows.filter(row => row.productId === 'a').reduce((sum,row) => sum + row.qty,0)).toBe(3);
    expect(rows.filter(row => row.productId === 'b').reduce((sum,row) => sum + row.qty,0)).toBe(7);
    for (const row of rows) expect(Math.round(row.price * 100) * row.qty).toBe(Math.round(row.total * 100));
  }
});
it('allocates free catalogue items without dividing by zero', () => {
  const rows = allocateBasketPrice(0.05, [item('a',2,0),item('b',1,0)]);
  expect(rows.reduce((sum,row) => sum + Math.round(row.total*100),0)).toBe(5);
});
it('rejects invalid totals and stock quantities', () => {
  for (const qty of [0,-1,1.2,10001]) expect(() => allocateBasketPrice(5,[item('a',qty,1)])).toThrow();
  expect(() => allocateBasketPrice(0,[item('a',1,1)])).toThrow();
  expect(() => allocateBasketPrice(1,[])).toThrow();
});

it('does not leak stock-reservation metadata into persisted order items', () => {
  const reserved = { ...item('a',3,40), basePrice:40, discountPercentage:25, total:120 };
  for (const line of allocateBasketPrice(100.01,[reserved])) {
    expect(Object.keys(line).sort()).toEqual(['name','price','productId','qty','sku','total']);
  }
});
