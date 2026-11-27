import { readFileSync } from 'node:fs';
const source = (path: string) => readFileSync(path,'utf8');

it('preserves progressive enhancement and real food discovery in the premium homepage', () => {
  const page = source('app/page.tsx');
  expect(source('components/discovery/ExploreSearch.tsx')).toContain('action="/discover"');
  expect(source('components/discovery/ExploreSearch.tsx')).toContain('name="q"');
  expect(page).toContain('href="/for-businesses"');
  expect(page).toContain('supplier:publicMakerWhere');
  expect(page).not.toContain('Taking preorders');
  expect(page).toContain('venues.length>0');
});
it('keeps discovery navigation keyboard accessible and respects reduced motion', () => {
  const rail = source('components/makers/DiscoveryRail.tsx');
  expect(rail).toContain('tabIndex={0}');
  expect(rail).toContain('prefers-reduced-motion');
  expect(rail).toContain('aria-label');
  expect(rail).toContain('observer.disconnect()');
  const directory = source('components/discovery/Directory.tsx');
  expect(directory).toContain('<select name="kind" defaultValue={kind');
  expect(directory).toContain('<select name="type" defaultValue={type');
  expect(directory).toContain('aria-current');
});
it('only recommends published items from the same maker', () => {
  const item = source('app/makers/[handle]/items/[slug]/page.tsx');
  expect(item).toContain('supplierId: maker.id, published: true, slug: {not: slug}');
  expect(item).toContain('<details open');
});
