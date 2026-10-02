const categoryIcons = new Set([
  'fresh-produce', 'dairy-eggs', 'pantry-staples', 'bakery',
  'meat-seafood', 'beverages', 'snacks', 'frozen-foods',
]);

/** Uploaded artwork takes priority; produce categories share real market photography. */
export function getCategoryImage(slug: string, imageUrl?: string | null): string {
  if (imageUrl?.trim()) return imageUrl.trim();
  if (/fresh-produce|vegetables|fruit/.test(slug)) return '/images/home/produce-basket.webp';
  if (/greens|herbs/.test(slug)) return '/images/home/market-bag.webp';
  return `/category-icons/${categoryIcons.has(slug) ? slug : 'placeholder'}.svg`;
}
