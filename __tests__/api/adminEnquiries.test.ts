jest.mock('next/server', () => jest.requireActual('next/server'));
import { NextRequest } from 'next/server';
import { GET, PATCH } from '@/app/api/admin/enquiries/route';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

jest.mock('@/lib/jwt', () => ({ verifyToken: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { user: { findUnique: jest.fn() }, $transaction: jest.fn(), contactEnquiry: { findMany: jest.fn(), count: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn() } } }));
const record = { id: '19d43c24-04f9-4789-8f47-75819b72b162', updatedAt: '2026-10-03T04:00:00.000Z', status: 'new', internalNotes: '', version: 0 };
const body = { ...record, status: 'in_progress', internalNotes: 'Check supply availability.' };
const req = (method = 'GET', data: unknown = body, query = '', authenticated = true) => new NextRequest('http://local/api/admin/enquiries'+query, { method, headers: authenticated ? { cookie: 'accessToken=test-token' } : {}, ...(method === 'PATCH' ? { body: JSON.stringify(data) } : {}) });
beforeEach(() => {
  jest.clearAllMocks();
  (verifyToken as jest.Mock).mockReturnValue({ userId: 'admin', type: 'access' });
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin', role: 'admin', isBanned: false, secondaryRoles: [] });
  (prisma.$transaction as jest.Mock).mockImplementation(values => Promise.all(values));
  (prisma.contactEnquiry.findMany as jest.Mock).mockResolvedValue([record]); (prisma.contactEnquiry.count as jest.Mock).mockResolvedValue(21);
  (prisma.contactEnquiry.updateMany as jest.Mock).mockResolvedValue({ count: 1 }); (prisma.contactEnquiry.findUnique as jest.Mock).mockResolvedValue(record);
});
it.each(['GET','PATCH'])('requires admin authentication for %s', async method => {
  const handler = method === 'GET' ? GET : PATCH;
  expect((await handler(req(method, body, '', false))).status).toBe(401);
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer', role: 'customer', secondaryRoles: [] });
  expect((await handler(req(method))).status).toBe(403);
  expect(prisma.contactEnquiry.findMany).not.toHaveBeenCalled(); expect(prisma.contactEnquiry.updateMany).not.toHaveBeenCalled();
});
it('rejects banned admins and refresh tokens', async () => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin', role: 'admin', isBanned: true }); expect((await GET(req())).status).toBe(403);
  (verifyToken as jest.Mock).mockReturnValue({ userId: 'admin', type: 'refresh' }); expect((await GET(req())).status).toBe(401);
});
it('paginates, filters and searches privately', async () => {
  const response = await GET(req('GET', body, '?page=2&status=new&source=producers&q=FP-19D43C24'));
  expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(await response.json()).toMatchObject({ total: 21, page: 2, pages: 2 });
  expect(prisma.contactEnquiry.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 20, where: expect.objectContaining({ status: 'new', source: 'producers', OR: expect.arrayContaining([{ id: { contains: '19D43C24', mode: 'insensitive' } }]) }) }));
});
it.each(['?page=0','?page=oops','?status=invalid','?source=invalid'])('rejects invalid filters: %s', async query => { expect((await GET(req('GET', body, query))).status).toBe(400); expect(prisma.contactEnquiry.findMany).not.toHaveBeenCalled(); });
it('saves notes and status only when the version matches', async () => {
  expect((await PATCH(req('PATCH'))).status).toBe(200);
  expect(prisma.contactEnquiry.updateMany).toHaveBeenCalledWith({ where: { id: body.id, version: 0 }, data: { status: 'in_progress', internalNotes: body.internalNotes, version: { increment: 1 } } });
});
it('rejects stale saves rather than overwriting another admin', async () => {
  (prisma.contactEnquiry.updateMany as jest.Mock).mockResolvedValue({ count: 0 }); expect((await PATCH(req('PATCH'))).status).toBe(409);
});
it('returns 404 for a missing enquiry', async () => {
  (prisma.contactEnquiry.updateMany as jest.Mock).mockResolvedValue({ count: 0 }); (prisma.contactEnquiry.findUnique as jest.Mock).mockResolvedValue(null); expect((await PATCH(req('PATCH'))).status).toBe(404);
});
it.each([{ status: 'done' },{ internalNotes: 'x'.repeat(5001) },{ version: -1 }])('rejects invalid changes: %s', async change => { expect((await PATCH(req('PATCH',{ ...body, ...change }))).status).toBe(400); expect(prisma.contactEnquiry.updateMany).not.toHaveBeenCalled(); });
it('reports list and save failures', async () => {
  (prisma.contactEnquiry.findMany as jest.Mock).mockRejectedValue(new Error('offline')); expect((await GET(req())).status).toBe(500);
  (prisma.contactEnquiry.updateMany as jest.Mock).mockRejectedValue(new Error('offline')); expect((await PATCH(req('PATCH'))).status).toBe(500);
});
