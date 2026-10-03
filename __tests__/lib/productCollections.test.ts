import { foodCollectionContentSchema, parseFoodCollectionContent } from '@/lib/collectionContent';
import { collectionAdminInputSchema } from '@/lib/collectionAdmin';

it('keeps product-linked legacy collections usable while removing recipe links', () => {
  const content = parseFoodCollectionContent(JSON.stringify({ recipeSlugs: ['retired-recipe'], productIds: ['live-product'] }));
  expect(content).toMatchObject({ productIds: ['live-product'] });
  expect(content).not.toHaveProperty('recipeSlugs');
});

it('rejects recipe-only and empty collections before publishing', () => {
  expect(foodCollectionContentSchema.safeParse({ recipeSlugs: ['retired-recipe'] }).success).toBe(false);
  expect(foodCollectionContentSchema.safeParse({ productIds: [] }).success).toBe(false);
  expect(collectionAdminInputSchema.safeParse({ title: 'Market edit', excerpt: 'A selection for your kitchen.', published: true, content: { recipeSlugs: ['retired-recipe'] } }).success).toBe(false);
});
