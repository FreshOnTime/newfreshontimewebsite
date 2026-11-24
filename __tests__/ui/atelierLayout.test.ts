import { readFileSync } from 'node:fs';
const source = (path: string) => readFileSync(path,'utf8');

it('preserves progressive enhancement and real food discovery in the premium homepage', () => {
  const page = source('app/page.tsx');
  expect(page).toContain('action="/makers"');
  expect(page).toContain('name="q"');
  expect(page).toContain('href="/join"');
  expect(page).toContain('supplier: publicMakerWhere');
  expect(page).toContain('batches.length > 0');
});
it('keeps discovery navigation keyboard accessible and respects reduced motion', () => {
  const rail = source('components/makers/DiscoveryRail.tsx');
  expect(rail).toContain('tabIndex={0}');
  expect(rail).toContain('prefers-reduced-motion');
  expect(rail).toContain('aria-label');
  expect(rail).toContain('observer.disconnect()');
  const directory = source('app/makers/page.tsx');
  expect(directory).toContain('aria-label="Browse by craft"');
  expect(directory).toContain('aria-current');
});
it('only recommends published items from the same maker', () => {
  const item = source('app/makers/[handle]/items/[slug]/page.tsx');
  expect(item).toContain('supplierId: maker.id, published: true, slug: {not: slug}');
  expect(item).toContain('<details open');
});
