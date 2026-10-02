import { normalizeBag, type ApiBag } from '@/lib/normalizeBag';
import { calculateBagTotals } from '@/lib/bagCalculations';

const bag = (product: ApiBag['items'][number]['product']): ApiBag => ({ _id: 'bag-1', name: 'Weekly groceries', items: [{ product, quantity: 2, price: 275 }] });

describe('Bag API mapping', () => {
  it('preserves current stock, primary image, gallery, and SKU from the real serializer', () => {
    const normalized = normalizeBag(bag({ _id: 'product-1', sku: 'BANANA-1', name: 'Bananas', stockQty: 8, image: '/banana.avif', images: ['/gallery.jpg'] }));
    expect(normalized.items[0].product).toMatchObject({ id: 'product-1', sku: 'BANANA-1', stock: 8, images: [{ url: '/banana.avif', alt: 'Bananas' }, { url: '/gallery.jpg', alt: 'Bananas' }] });
  });

  it('keeps zero stock instead of falling back to a legacy positive value', () => {
    expect(normalizeBag(bag({ id: 'product-1', stockQty: 0, stockQuantity: 50 })).items[0].product.stock).toBe(0);
  });

  it('supports legacy image objects, stock, and unit labels', () => {
    expect(normalizeBag(bag({ _id: 'product-1', name: 'Rice', image: { url: '/rice.jpg', alt: 'Rice packet' }, stockQuantity: 12, measurementType: 'kg' })).items[0].product).toMatchObject({ images: [{ url: '/rice.jpg', alt: 'Rice packet' }], stock: 12, unit: 'kg' });
  });

  it('uses the API item price consistently without calculating another discount', () => {
    const normalized = normalizeBag(bag({ _id: 'product-1', stockQty: 8 }));
    expect(normalized.items[0].product.price).toBe(275);
    expect(calculateBagTotals(normalized.items)).toEqual({ total: 550, originalTotal: 550, savings: 0 });
  });

  it('skips deleted or invalid product references and supports empty bags', () => {
    expect(normalizeBag(bag(null)).items).toEqual([]);
    expect(normalizeBag(bag({ name: 'Deleted product' })).items).toEqual([]);
    expect(normalizeBag({ _id: 'empty', name: 'Empty', items: [] })).toMatchObject({ items: [], tags: [] });
  });

  it('does not allow unknown, negative, or non-finite stock to enable increases', () => {
    for (const stockQty of [undefined, -1, NaN, Infinity]) {
      expect(normalizeBag(bag({ _id: 'product-1', stockQty })).items[0].product.stock).toBe(0);
    }
  });
});
