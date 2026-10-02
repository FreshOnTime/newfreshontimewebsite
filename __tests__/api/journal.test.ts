import { GET } from '@/app/api/blogs/route';
import { POST, GET as adminGET } from '@/app/api/admin/blogs/route';
import { PUT, DELETE } from '@/app/api/admin/blogs/[id]/route';
import { listPublishedJournalEntries } from '@/lib/journalService';
import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';

jest.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: jest.fn(), revalidateTag: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { blog: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() } } }));
jest.mock('@/lib/middleware/adminAuth', () => ({ requireAdminSimple: (fn: unknown) => fn, requireAdmin: (fn: unknown) => fn, logAuditAction: jest.fn() }));

const blog = prisma.blog as unknown as Record<string, jest.Mock>;
const record = { id: 'article-1', slug: 'market-notes', title: 'Market notes', excerpt: 'Ideas for everyday cooking.', category: null, published: true, publishedAt: new Date('2026-10-01T12:00:00Z'), featuredImage: { url: '/images/home/tomatoes.webp', alt: 'Tomatoes' }, author: null };
const request = (body: object) => Object.assign(new Request('https://freshpick.lk/api/admin/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), { user: { userId: 'admin-1', firstName: 'Test' } });
const context = { params: Promise.resolve({ id: record.id }) };

beforeEach(() => { jest.clearAllMocks(); });

it('keeps draft/deleted and commerce entries out while admitting uncategorised journal posts and retaining search', async () => {
  blog.findMany.mockResolvedValue([record]); blog.count.mockResolvedValue(1);
  const response = await GET(new Request('https://freshpick.lk/api/blogs?search=market') as never);
  expect(response.status).toBe(200);
  const where = blog.findMany.mock.calls[0][0].where;
  expect(where).toMatchObject({ published: true, isDeleted: false, AND: [{ OR: [{ category: null }, { category: { notIn: ['recipe', 'collection'] } }] }], OR: [{ title: { contains: 'market', mode: 'insensitive' } }, { excerpt: { contains: 'market', mode: 'insensitive' } }] });
  expect(await response.json()).toMatchObject({ blogs: [{ _id: record.id }], pagination: { total: 1 } });
});

it('loads only three lightweight summaries and serialises dates and image JSON safely', async () => {
  blog.findMany.mockResolvedValue([record, { ...record, id: 'no-photo', featuredImage: ['invalid'], publishedAt: null }]);
  const entries = await listPublishedJournalEntries();
  expect(blog.findMany.mock.calls[0][0]).toMatchObject({ take: 3, where: { published: true, isDeleted: false } });
  expect(blog.findMany.mock.calls[0][0].select.content).toBeUndefined();
  expect(entries[0]).toMatchObject({ publishedAt: '2026-10-01T12:00:00.000Z', featuredImage: { url: '/images/home/tomatoes.webp' } });
  expect(entries[1]).toMatchObject({ publishedAt: null, featuredImage: null });
});

it('keeps recipe and collection records out of the journal editor while allowing drafts', async () => {
  blog.findMany.mockResolvedValue([]); blog.count.mockResolvedValue(0);
  const response = await adminGET(new Request('https://freshpick.lk/api/admin/blogs') as never);
  expect(response.status).toBe(200);
  const where = blog.findMany.mock.calls[0][0].where;
  expect(where.AND).toEqual([{ OR: [{ category: null }, { category: { notIn: ['recipe', 'collection'] } }] }]);
  expect(where.published).toBeUndefined();
});

it('rejects reserved commerce categories in the journal editor', async () => {
  const response = await POST(request({ title: record.title, excerpt: record.excerpt, content: 'A sufficiently long article about good ingredients and everyday cooking.', category: 'recipe' }) as never);
  expect(response.status).toBe(400);
  expect(blog.create).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

it('invalidates homepage and journal content when publishing a new post', async () => {
  blog.findFirst.mockResolvedValue(null); blog.create.mockResolvedValue(record);
  const response = await POST(request({ title: record.title, excerpt: record.excerpt, content: 'A sufficiently long article about good ingredients and everyday cooking.', published: true }) as never);
  expect(response.status).toBe(201);
  expect(revalidateTag).toHaveBeenCalledWith('journal', { expire: 0 });
  expect(revalidatePath).toHaveBeenCalledWith('/');
  expect(revalidatePath).toHaveBeenCalledWith('/blog');
  expect(revalidatePath).toHaveBeenCalledWith('/blog/market-notes');
});

it('invalidates both old and new article URLs when changing a slug', async () => {
  blog.findFirst.mockResolvedValueOnce(record).mockResolvedValueOnce(null);
  blog.update.mockResolvedValue({ ...record, slug: 'new-market-notes' });
  const response = await PUT(request({ slug: 'new-market-notes' }) as never, context);
  expect(response.status).toBe(200);
  expect(revalidatePath).toHaveBeenCalledWith('/blog/market-notes');
  expect(revalidatePath).toHaveBeenCalledWith('/blog/new-market-notes');
});

it('invalidates the homepage and deleted article after a soft delete', async () => {
  blog.findFirst.mockResolvedValue(record); blog.update.mockResolvedValue(record);
  const response = await DELETE(request({}) as never, context);
  expect(response.status).toBe(200);
  expect(blog.update).toHaveBeenCalledWith({ where: { id: record.id }, data: { isDeleted: true } });
  expect(revalidatePath).toHaveBeenCalledWith('/');
  expect(revalidatePath).toHaveBeenCalledWith('/blog/market-notes');
});
