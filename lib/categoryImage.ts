// Exact aliases avoid giving categories such as fruit juice a produce photograph.
const categoryPhotos: Readonly<Record<string, string>> = {
  cookedfood: 'cooked-food',
  'cooked-food': 'cooked-food',
  'ready-meals': 'cooked-food',
  'prepared-meals': 'cooked-food',
  'fresh-produce': 'produce',
  vegetables: 'produce',
  'fresh-vegetables': 'produce',
  fruit: 'fruits',
  fruits: 'fruits',
  'fresh-fruit': 'fruits',
  'fresh-fruits': 'fruits',
  greens: 'greens-herbs',
  herbs: 'greens-herbs',
  'leafy-greens': 'greens-herbs',
  'greens-herbs': 'greens-herbs',
  'dairy-eggs': 'dairy-eggs',
  'dairy-and-eggs': 'dairy-eggs',
  dairy: 'dairy-eggs',
  eggs: 'dairy-eggs',
  'meat-seafood': 'meat-seafood',
  'meat-and-seafood': 'meat-seafood',
  seafood: 'meat-seafood',
  fish: 'meat-seafood',
  'pantry-staples': 'pantry-staples',
  pantry: 'pantry-staples',
  'grains-pulses': 'pantry-staples',
  bakery: 'bakery',
  'bread-pastries': 'bakery',
  beverages: 'beverages',
  drinks: 'beverages',
  juices: 'beverages',
  'fruit-juice': 'beverages',
};
const categoryIcons = new Set(['snacks', 'frozen-foods']);

/** Admin uploads take priority over locally hosted category photography. */
export function getCategoryImage(slug: string, imageUrl?: string | null): string {
  if (imageUrl?.trim()) return imageUrl.trim();
  const key = slug.trim().toLowerCase();
  // The prototype guard keeps unknown database slugs on the neutral fallback.
  const photo = Object.hasOwn(categoryPhotos, key) ? categoryPhotos[key] : undefined;
  if (photo === 'produce') return '/images/editorial/market-crates.webp';
  if (photo) return `/images/categories/${photo}.webp`;
  return `/category-icons/${categoryIcons.has(key) ? key : 'placeholder'}.svg`;
}
