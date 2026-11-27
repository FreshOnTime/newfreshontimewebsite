import { absoluteUrl, SITE_URL } from '@/lib/config/site';
import { breadcrumbJsonLd, catalogueMetadata, pageMetadata, privateMetadata, serializeJsonLd } from '@/lib/seo';
import { PUBLIC_PAGES } from '@/lib/publicPages';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import prisma from '@/lib/prisma';
import { GET } from '@/app/api/blogs/route';

jest.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: jest.fn(), revalidateTag: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { discoveryProspect: {findMany:jest.fn()}, discoveryContent:{findMany:jest.fn()}, supplier: { findMany: jest.fn() }, makerItem: { findMany: jest.fn() }, product: { findMany: jest.fn() }, category: { findMany: jest.fn() }, blog: { findMany: jest.fn(), count: jest.fn() } } }));

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
  expect(pageMetadata({ title: 'Blog | FreshPick', description: '', path: '/blog' }).title).toEqual({ absolute: 'Blog | FreshPick' });
  expect(meta.openGraph).toMatchObject({ url: absoluteUrl('/help'), images: [{ url: absoluteUrl('/opengraph-image') }] });
  expect(absoluteUrl('https://images.example.com/food.jpg')).toBe('https://images.example.com/food.jpg');
});

it('describes ordered public breadcrumb URLs with safe JSON-LD', () => {
  const schema = breadcrumbJsonLd([{name:'Food Atlas',path:'/food-atlas'},{name:'Kottu & <food>',path:'/food-atlas/kottu'}]);
  expect(schema).toEqual({
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Food Atlas',item:absoluteUrl('/food-atlas')},
      {'@type':'ListItem',position:2,name:'Kottu & <food>',item:absoluteUrl('/food-atlas/kottu')},
    ],
  });
  expect(serializeJsonLd(schema)).not.toMatch(/[<>&]/);
  expect(JSON.parse(serializeJsonLd(schema))).toEqual(schema);
});

it('preserves paginated canonicals and excludes faceted catalogue URLs from indexing', () => {
  expect(catalogueMetadata('/products', 'Market', '', { page: '2' }).alternates?.canonical).toBe(absoluteUrl('/products?page=2'));
  expect(catalogueMetadata('/products', 'Market', '', { page: '-1' }).alternates?.canonical).toBe(absoluteUrl('/products'));
  expect(catalogueMetadata('/products', 'Market', '', { search: 'lime', page: '2' })).toMatchObject({ robots: { index: false, follow: true }, alternates: { canonical: absoluteUrl('/products') } });
});

it('keeps private pages out of indexing without blocking rendering assets', () => {
  expect(privateMetadata.robots).toMatchObject({ index: false, googleBot: { index: false } });
  expect(robots()).toMatchObject({
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
    rules: expect.arrayContaining([
      expect.objectContaining({ userAgent: '*' }),
      expect.objectContaining({ userAgent: expect.arrayContaining(['OAI-SearchBot', 'ChatGPT-User']) }),
    ]),
  });
  expect(JSON.stringify(robots())).not.toContain('/_next/');
  for (const path of ['/checkout', '/profile', '/auth/login']) expect(PUBLIC_PAGES.map(page => page.path)).not.toContain(path);
});

it('indexes published maker profiles, items, stories and editorial articles', async () => {
  (prisma.discoveryProspect.findMany as jest.Mock).mockResolvedValue([{id:'approved-cafe'}]);
  (prisma.discoveryContent.findMany as jest.Mock).mockResolvedValue([{kind:'guide',slug:'test-guide',updatedAt:new Date('2026-11-01T00:00:00Z')}]);
  (prisma.supplier.findMany as jest.Mock).mockResolvedValue([{makerHandle:'local-baker'}]);
  (prisma.makerItem.findMany as jest.Mock).mockResolvedValue([{slug:'sourdough',supplier:{makerHandle:'local-baker'}}]);
  (prisma.blog.findMany as jest.Mock).mockImplementation(({where}) =>
    where.supplier ? [{slug:'from-our-kitchen',supplier:{makerHandle:'local-baker'}}] : []);
  const urls = (await sitemap()).map(page => page.url);
  expect(urls).toEqual(expect.arrayContaining(['/makers/local-baker','/makers/local-baker/items/sourdough','/makers/local-baker/stories/from-our-kitchen'].map(absoluteUrl)));
  expect(urls).not.toContain(absoluteUrl('/checkout'));
  expect(urls).toContain(absoluteUrl('/places/approved-cafe'));
  expect(urls).toContain(absoluteUrl('/guides/test-guide'));
  expect(prisma.discoveryProspect.findMany).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({reviewStatus:'approved',permissionStatus:'cleared',reviewedAt:{not:null}})}));
  expect(prisma.makerItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ published:true, supplier:expect.objectContaining({makerPublished:true}) }),
  }));
});

describe('sitemap database failure isolation', () => {
  const sources = [
    prisma.supplier.findMany, prisma.makerItem.findMany, prisma.blog.findMany,
    prisma.discoveryProspect.findMany, prisma.discoveryContent.findMany,
  ] as jest.Mock[];
  beforeEach(() => sources.forEach(mock => mock.mockReset().mockResolvedValue([])));
  afterEach(() => {
    sources.forEach(mock => mock.mockReset());
    jest.restoreAllMocks();
  });

  it('preserves healthy public URLs when one source rejects and another throws synchronously', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    (prisma.supplier.findMany as jest.Mock).mockResolvedValue([{makerHandle:'healthy-baker'}]);
    (prisma.makerItem.findMany as jest.Mock).mockRejectedValue(new Error('missing table'));
    (prisma.discoveryContent.findMany as jest.Mock).mockImplementation(() => { throw new Error('unavailable'); });
    (prisma.blog.findMany as jest.Mock).mockReturnValue([]);
    const urls = (await sitemap()).map(page => page.url);
    expect(urls).toContain(absoluteUrl('/'));
    expect(urls).toContain(absoluteUrl('/makers/healthy-baker'));
    expect(log).toHaveBeenCalledWith('Sitemap source unavailable:', 'items');
    expect(log).toHaveBeenCalledWith('Sitemap source unavailable:', 'discovery content');
  });

  it('rejects a total database outage instead of emitting a misleading sitemap', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    sources.forEach(mock => mock.mockRejectedValue(new Error('database unavailable')));
    await expect(sitemap()).rejects.toThrow('All dynamic sitemap sources unavailable');
    expect(log).toHaveBeenCalledTimes(7);
  });
});

it.each(['page=-1', 'page=0', 'page=NaN', 'page=1.5', 'page=100001', 'limit=0', 'limit=-1', 'limit=invalid', 'limit=51'])('rejects an invalid public journal query: %s', async query => {
  const response = await GET(new Request(`https://freshpick.lk/api/blogs?${query}`) as never);
  expect(response.status).toBe(400);
  expect(prisma.blog.findMany).not.toHaveBeenCalled();
});
