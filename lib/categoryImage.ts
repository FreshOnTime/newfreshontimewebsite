const categoryIcons = new Set([
  'fresh-produce', 'dairy-eggs', 'pantry-staples', 'bakery',
  'meat-seafood', 'beverages', 'snacks', 'frozen-foods',
]);

/** Use the category's uploaded artwork first, then its matching food icon. */
export function getCategoryImage(slug: string, imageUrl?: string | null): string {
  return imageUrl?.trim() || `/category-icons/${categoryIcons.has(slug) ? slug : 'placeholder'}.svg`;
}
