/** Allocate the advertised basket price in cents; split lines only for rounding. */
export function allocateBasketPrice(total: number, items: { productId: string; sku: string; name: string; qty: number; price: number }[]) {
  const cents = Math.round(total * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0 || !items.length || items.some(item => !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 10000 || !Number.isFinite(item.price) || item.price < 0)) throw new Error('Invalid basket pricing');
  const values = items.map(item => BigInt(Math.round(item.price * 100)) * BigInt(item.qty));
  const weights = values.some(value => value > BigInt(0)) ? values : items.map(item => BigInt(item.qty));
  const sum = weights.reduce((a, b) => a + b, BigInt(0));
  const shares = weights.map((weight, index) => {
    const numerator = BigInt(cents) * BigInt(weight);
    return { index, cents: Number(numerator / BigInt(sum)), remainder: numerator % BigInt(sum) };
  });
  let remaining = cents - shares.reduce((value, share) => value + share.cents, 0);
  for (const share of [...shares].sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1)) {
    if (remaining-- <= 0) break;
    share.cents++;
  }
  return shares.flatMap(share => {
    const { price: _price, ...item } = items[share.index];
    void _price;
    const unitCents = Math.floor(share.cents / item.qty);
    const extra = share.cents % item.qty;
    return [
      ...(item.qty > extra ? [{ ...item, qty: item.qty - extra, price: unitCents / 100, total: (item.qty - extra) * unitCents / 100 }] : []),
      ...(extra ? [{ ...item, qty: extra, price: (unitCents + 1) / 100, total: extra * (unitCents + 1) / 100 }] : []),
    ];
  });
}
