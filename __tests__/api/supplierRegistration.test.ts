import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/suppliers/register/route';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

jest.mock('@/lib/auth', () => ({ verifyToken: jest.fn() }));
jest.mock('@/lib/utils/rateLimit', () => ({ withRateLimit: (handler: unknown) => handler }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { $transaction: jest.fn(), user: { findUnique: jest.fn(), updateMany: jest.fn() }, supplier: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() } } }));
const body = { companyName: 'Market producer', contactName: 'Producer', phone: '0771234567', email: 'supplier@example.com', address: { addressLine1: 'Market Road', city: 'Colombo', province: 'Western', postalCode: '00100', country: 'Sri Lanka' }, productListCsv: 'Produce, pantry' };
const request = (data: unknown = body) => ({ json: async () => data }) as NextRequest;

beforeEach(() => {
  jest.clearAllMocks();
  (verifyToken as jest.Mock).mockResolvedValue({ userId: 'customer', role: 'customer' });
  (prisma.$transaction as jest.Mock).mockImplementation(fn => fn(prisma));
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer', role: 'customer', supplierId: null });
  (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  (prisma.supplier.findFirst as jest.Mock).mockResolvedValue(null);
  (prisma.supplier.create as jest.Mock).mockResolvedValue({ id: 'new-supplier' });
});
it('requires an authenticated account before saving supplier data', async () => {
  (verifyToken as jest.Mock).mockResolvedValue(null);
  expect((await POST(request())).status).toBe(401);
  expect(prisma.$transaction).not.toHaveBeenCalled();
});
it('atomically saves the supplier, catalogue note and account link', async () => {
  expect((await POST(request())).status).toBe(201);
  expect(prisma.supplier.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ notes: body.productListCsv, phone: body.phone }) }));
  expect(prisma.user.updateMany).toHaveBeenCalledWith({ where: { id: 'customer', supplierId: null }, data: { supplierId: 'new-supplier', role: 'supplier' } });
  expect(prisma.$transaction).toHaveBeenCalledTimes(1);
});
it('reuses only the signed-in account\'s supplier link on retry', async () => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer', supplierId: 'own-supplier' });
  (prisma.supplier.findUnique as jest.Mock).mockResolvedValue({ id: 'own-supplier' });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ supplier: { id: 'own-supplier' } });
  expect(prisma.supplier.create).not.toHaveBeenCalled();
  expect(prisma.user.updateMany).not.toHaveBeenCalled();
});
it('never claims an unrelated supplier based on submitted contact details', async () => {
  (prisma.supplier.findFirst as jest.Mock).mockResolvedValue({ id: 'another-supplier' });
  expect((await POST(request())).status).toBe(409);
  expect(prisma.supplier.create).not.toHaveBeenCalled();
  expect(prisma.user.updateMany).not.toHaveBeenCalled();
});
it('returns failure when a concurrent account link changes rather than reporting success', async () => {
  (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
  expect((await POST(request())).status).toBe(409);
});
it('does not downgrade an administrator role when creating a supplier link', async () => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin', role: 'admin', supplierId: null });
  expect((await POST(request())).status).toBe(201);
  expect(prisma.user.updateMany).toHaveBeenCalledWith({ where: { id: 'admin', supplierId: null }, data: { supplierId: 'new-supplier' } });
});
it('rejects malformed supplier details before starting a transaction', async () => {
  expect((await POST(request({ ...body, companyName: ' ', address: {} }))).status).toBe(400);
  expect(prisma.$transaction).not.toHaveBeenCalled();
});
it('returns a recoverable failure when saving the link fails', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  (prisma.user.updateMany as jest.Mock).mockRejectedValue(new Error('offline'));
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect(JSON.stringify(await response.json())).not.toContain('offline');
  log.mockRestore();
});
