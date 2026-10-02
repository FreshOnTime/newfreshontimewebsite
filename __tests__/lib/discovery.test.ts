import { absoluteUrl, SITE_URL } from '@/lib/config/site';
import { catalogueMetadata, pageMetadata, privateMetadata, serializeJsonLd } from '@/lib/seo';
import { PUBLIC_PAGES } from '@/lib/publicPages';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import prisma from '@/lib/prisma';
import { GET } from '@/app/api/blogs/route';

jest.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: jest.fn(), revalidateTag: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { product: { findMany: jest.fn() }, category: { findMany: jest.fn() }, blog: { findMany: jest.fn(), count: jest.fn() } } }));

beforeEach(() => jest.clearAllMocks());

it('keeps script-breaking content inert and preserves the original data', () => {
  const data = { title: '</script><script>alert(1)</script>', description: 'Tomatoes & greens > anything' };
  const text = serializeJsonLd(data);
  expect(text).not.toMatch(/[<>&]/);
  expect(JSON.parse(text)).toEqual(data);
});

it('gives public pages distinct canonical URLs and working share asset paths', () => {
  const meta = pageMetadata({ title: 'Help', description: 'Ordering answers', path: '/help' });
  expect(meta.alternates?.canonical).toBe(absoluteUrl('/help'));
  expect(meta.title).toEqual({ absolute: 'Help | FreshPick' });
  expect(pageMetadata({ title: 'Recipes | FreshPick', description: '', path: '/recipes' }).title).toEqual({ absolute: 'Recipes | FreshPick' });
  expect(meta.openGraph).toMatchObject({ url: absoluteUrl('/help'), images: [{ url: absoluteUrl('/opengraph-image') }] });
  expect(absoluteUrl('https://images.example.com/food.jpg')).toBe('https://images.example.com/food.jpg');
});

it('preserves paginated canonicals and excludes faceted catalogue URLs from indexing', () => {
  expect(catalogueMetadata('/products', 'Market', '', { page: '2' }).alternates?.canonical).toBe(absoluteUrl('/products?page=2'));
  expect(catalogueMetadata('/products', 'Market', '', { page: '-1' }).alternates?.canonical).toBe(absoluteUrl('/products'));
  expect(catalogueMetadata('/products', 'Market', '', { search: 'lime', page: '2' })).toMatchObject({ robots: { index: false, follow: true }, alternates: { canonical: absoluteUrl('/products') } });
});

it('keeps private pages out of indexing without blocking rendering assets', () => {
  expect(privateMetadata.robots).toMatchObject({ index: false, googleBot: { index: false } });
  expect(robots()).toMatchObject({ sitemap: absoluteUrl('/sitemap.xml'), host: SITE_URL, rules: { userAgent: '*' } });
  expect(JSON.stringify(robots())).not.toContain('/_next/');
  for (const path of ['/checkout', '/profile', '/auth/login']) expect(PUBLIC_PAGES.map(page => page.path)).not.toContain(path);
});

it('includes journal, valid recipes/collections and creator URLs, using encoded canonical identifiers', async () => {
  (prisma.product.findMany as jest.Mock).mockResolvedValue([{ sku: 'LIME / 01', updatedAt: new Date('2026-10-01') }]);
  (prisma.category.findMany as jest.Mock).mockResolvedValue([{ slug: 'fresh-produce', updatedAt: new Date('2026-10-01') }]);
  (prisma.blog.findMany as jest.Mock).mockImplementation(({ where }) => where.category === 'recipe'
    ? [{ slug: 'lime-recipe', authorId: 'creator-1', content: JSON.stringify({ ingredients: [{ productId: 'lime', quantity: 1 }], steps: ['Cut the lime.'] }), updatedAt: new Date('2026-10-01') }, { slug: 'malformed-recipe', content: 'invalid' }]
    : where.category === 'collection'
      ? [{ slug: 'market-edit', content: JSON.stringify({ productIds: ['lime'] }), updatedAt: new Date('2026-10-01') }]
      : [{ slug: 'market-journal', updatedAt: new Date('2026-10-01') }]);
  const pages = await sitemap(); const urls = pages.map(page => page.url);
  expect(urls).toEqual(expect.arrayContaining(['/blog', '/help', '/b2b', '/creators', '/blog/market-journal', '/recipes/lime-recipe', '/collections/market-edit', '/creators/creator-1', '/products/LIME%20%2F%2001'].map(absoluteUrl)));
  expect(urls).not.toContain(absoluteUrl('/recipes/malformed-recipe'));
  expect(pages.find(page => page.url === absoluteUrl('/help'))?.lastModified).toBeUndefined();
  expect(prisma.blog.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ published: true, isDeleted: false, AND: expect.any(Array) }) }));
});

it('retains healthy sitemap sections when one database query fails', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  (prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('offline'));
  (prisma.category.findMany as jest.Mock).mockResolvedValue([{ slug: 'fresh-produce' }]);
  (prisma.blog.findMany as jest.Mock).mockResolvedValue([{ slug: 'market-story' }]);
  const urls = (await sitemap()).map(page => page.url);
  expect(urls).toContain(absoluteUrl('/categories/fresh-produce'));
  expect(urls).toContain(absoluteUrl('/blog/market-story'));
  log.mockRestore();
});

it.each(['page=-1', 'page=0', 'page=NaN', 'page=1.5', 'page=100001', 'limit=0', 'limit=-1', 'limit=invalid', 'limit=51'])('rejects an invalid public journal query: %s', async query => {
  const response = await GET(new Request(`https://freshpick.lk/api/blogs?${query}`) as never);
  expect(response.status).toBe(400);
  expect(prisma.blog.findMany).not.toHaveBeenCalled();
});
