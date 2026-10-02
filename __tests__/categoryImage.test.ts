import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCategoryImage } from '@/lib/categoryImage';

describe('category photography', () => {
  it('uses real, available photographs for every current storefront category', () => {
    const slugs = ['cookedfood', 'fresh-produce', 'dairy-eggs', 'meat-seafood', 'pantry-staples', 'bakery', 'beverages'];
    const images = slugs.map(slug => getCategoryImage(slug));
    expect(new Set(images).size).toBe(slugs.length);
    for (const image of images) {
      expect(image.endsWith('.webp')).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', image))).toBe(true);
    }
  });

  it('keeps uploaded category artwork, including remote URLs and query strings', () => {
    expect(getCategoryImage('bakery', ' /uploads/custom-bread.jpg ')).toBe('/uploads/custom-bread.jpg');
    expect(getCategoryImage('fruits', 'https://example.com/fruit.jpg?v=2')).toBe('https://example.com/fruit.jpg?v=2');
    expect(getCategoryImage('bakery', '   ')).toBe(getCategoryImage('bakery'));
  });

  it('distinguishes fruit, vegetables, leafy greens and fruit juice', () => {
    expect(getCategoryImage('fruits')).not.toBe(getCategoryImage('vegetables'));
    expect(getCategoryImage('herbs')).toBe(getCategoryImage('leafy-greens'));
    expect(getCategoryImage('fruit-juice')).toBe(getCategoryImage('beverages'));
    expect(getCategoryImage(' FRUITS ')).toBe(getCategoryImage('fruits'));
  });

  it('does not assign unrelated food photos to unknown or partial-match categories', () => {
    for (const slug of ['fruit-gifts', 'herbs-supplements', 'toString', '__proto__', 'new-category']) {
      expect(getCategoryImage(slug)).toBe('/category-icons/placeholder.svg');
    }
    expect(getCategoryImage('frozen-foods')).toBe('/category-icons/frozen-foods.svg');
  });
});
