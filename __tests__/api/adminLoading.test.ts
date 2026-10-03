import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import { GET as suppliers } from '@/app/api/admin/suppliers/route';
import { GET as leads, PATCH as updateLead } from '@/app/api/admin/business-leads/route';
import { GET as enquiries } from '@/app/api/admin/enquiries/route';
import { GET as applications } from '@/app/api/admin/supplier-applications/route';
import prisma from '@/lib/prisma';

jest.mock('next/server', () => jest.requireActual('next/server'));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  user: { findUnique: jest.fn() },
  supplier: { findMany: jest.fn(), count: jest.fn() },
  businessLead: { findMany: jest.fn(), update: jest.fn() },
  contactEnquiry: { findMany: jest.fn(), count: jest.fn() },
  $transaction: jest.fn(),
} }));

const admin = { id: 'admin', role: 'admin', secondaryRoles: [], isBanned: false, firstName: 'Admin' };
const routes = [['suppliers', suppliers], ['partnerships', leads], ['enquiries', enquiries], ['supplier applications', applications]] as const;
function request(path = '', expiresIn = 60, body?: unknown) {
  const token = sign({ userId: admin.id, type: 'access', role: 'admin' }, process.env.JWT_SECRET!, { expiresIn });
  return new NextRequest(`http://localhost/api/admin/${path}`, {
    method: body ? 'PATCH' : 'GET', headers: { cookie: `accessToken=${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(admin);
  (prisma.supplier.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.supplier.count as jest.Mock).mockResolvedValue(0);
  (prisma.businessLead.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.contactEnquiry.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.contactEnquiry.count as jest.Mock).mockResolvedValue(0);
  (prisma.$transaction as jest.Mock).mockImplementation(values => Promise.all(values));
});
afterEach(() => jest.restoreAllMocks());

it.each(routes)('%s returns 401 for expired sessions so the client can refresh', async (_name, handler) => {
  expect((await handler(request('', -60))).status).toBe(401);
  expect(prisma.user.findUnique).not.toHaveBeenCalled();
  expect(prisma.supplier.findMany).not.toHaveBeenCalled();
  expect(prisma.businessLead.findMany).not.toHaveBeenCalled();
  expect(prisma.contactEnquiry.findMany).not.toHaveBeenCalled();
});
it.each(routes)('%s still refuses a customer even if JWT claims admin', async (_name, handler) => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...admin, role: 'customer' });
  expect((await handler(request())).status).toBe(403);
  expect(prisma.supplier.findMany).not.toHaveBeenCalled();
  expect(prisma.businessLead.findMany).not.toHaveBeenCalled();
  expect(prisma.contactEnquiry.findMany).not.toHaveBeenCalled();
});
it.each(routes)('%s accepts a secondary administrator and keeps data private', async (_name, handler) => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...admin, role: 'customer', secondaryRoles: ['admin'] });
  const response = await handler(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
});
it.each(['P2021', 'P2022'])('reports missing schema %s as 503, never an empty success or auth failure', async code => {
  const failure = Object.assign(new Error('Private database column details'), { code });
  (prisma.supplier.findMany as jest.Mock).mockRejectedValue(failure);
  (prisma.businessLead.findMany as jest.Mock).mockRejectedValue(failure);
  (prisma.contactEnquiry.findMany as jest.Mock).mockRejectedValue(failure);
  for (const [, handler] of routes) {
    const response = await handler(request());
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.code).toBe('DATABASE_SCHEMA_OUTDATED');
    expect(JSON.stringify(data)).not.toContain('Private database');
  }
});
it('does not misclassify database failure during authentication as a bad session', async () => {
  (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database offline'));
  expect((await leads(request())).status).toBe(500);
  expect(prisma.businessLead.findMany).not.toHaveBeenCalled();
});
it('does not return 401 when partnership data fails after authentication', async () => {
  (prisma.businessLead.findMany as jest.Mock).mockRejectedValue(new Error('Database offline'));
  expect((await leads(request())).status).toBe(500);
});
it.each(['?page=0', '?page=abc', '?limit=0', '?limit=-1'])('rejects malformed supplier pagination %s', async query => {
  expect((await suppliers(request(`suppliers${query}`))).status).toBe(400);
  expect(prisma.supplier.findMany).not.toHaveBeenCalled();
});
it('bounds supplier limits and preserves a real search query', async () => {
  const response = await suppliers(request('suppliers?page=2&limit=1000&search=Grower'));
  expect(response.status).toBe(200);
  expect(prisma.supplier.findMany).toHaveBeenCalledWith(expect.objectContaining({
    skip: 100, take: 100, where: { OR: [
      { name: { contains: 'Grower', mode: 'insensitive' } },
      { email: { contains: 'Grower', mode: 'insensitive' } },
    ] },
  }));
});
it('partnership filters and missing update records return meaningful results', async () => {
  await leads(request('business-leads?status=qualified'));
  expect(prisma.businessLead.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: 'qualified' } }));
  (prisma.businessLead.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
  expect((await updateLead(request('', 60, { id: 'missing', status: 'won' }))).status).toBe(404);
});
