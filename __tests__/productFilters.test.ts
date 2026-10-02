import { getPriceRange, updateProductFilters } from '@/lib/productFilters';

describe('Applied catalogue filters', () => {
  it('changes one filter without submitting a draft search or losing unrelated filters', () => {
    const result = new URLSearchParams(updateProductFilters('search=tomato&categoryId=produce&tags=Local,Vegan&page=4&limit=12', { sort: 'price-asc' }));
    expect(result.get('search')).toBe('tomato');
    expect(result.get('categoryId')).toBe('produce');
    expect(result.get('tags')).toBe('Local,Vegan');
    expect(result.get('limit')).toBe('12');
    expect(result.get('sort')).toBe('price-asc');
    expect(result.has('page')).toBe(false);
  });

  it('removes a price range while preserving an applied search and category', () => {
    const result = new URLSearchParams(updateProductFilters('search=milk&categoryId=dairy&minPrice=100&maxPrice=900&page=3', { minPrice: null, maxPrice: null }));
    expect(Object.fromEntries(result)).toEqual({ search: 'milk', categoryId: 'dairy' });
  });

  it('round trips encoded searches and removes empty values', () => {
    const result = new URLSearchParams(updateProductFilters('tags=Vegan&inStock=true', { search: 'rice & beans / 1kg', tags: '' }));
    expect(result.get('search')).toBe('rice & beans / 1kg');
    expect(result.get('inStock')).toBe('true');
    expect(result.has('tags')).toBe(false);
  });

  it('preserves zero and higher price limits and rejects invalid ranges', () => {
    expect(getPriceRange(new URLSearchParams('maxPrice=0'))).toEqual([0, 0]);
    expect(getPriceRange(new URLSearchParams('minPrice=6000&maxPrice=9000'))).toEqual([6000, 9000]);
    expect(getPriceRange(new URLSearchParams('minPrice=-10&maxPrice=Infinity'))).toEqual([0, 5000]);
    expect(getPriceRange(new URLSearchParams('minPrice=6000&maxPrice=100'))).toEqual([6000, 6000]);
  });
});
