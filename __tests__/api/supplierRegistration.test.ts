import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/suppliers/register/route';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

jest.mock('@/lib/auth', () => ({ verifyToken: jest.fn() }));
jest.mock('@/lib/utils/rateLimit', () => ({ withRateLimit: (handler: unknown) => handler }));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    user: { findUnique: jest.fn(), updateMany: jest.fn(), findMany: jest.fn() },
    supplier: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    notification: { createMany: jest.fn() },
  },
}));

const body = {
  companyName: 'Market producer',
  contactName: 'Producer',
  phone: '0771234567',
  email: 'supplier@example.com',
  address: { addressLine1: 'Market Road', city: 'Colombo', province: 'Western', postalCode: '00100', country: 'Sri Lanka' },
  productListCsv: 'Tomatoes\nLeafy greens\nCoconut',
};
const request = (data: unknown = body) => ({ json: async () => data }) as NextRequest;

beforeEach(() => {
  jest.clearAllMocks();
  (verifyToken as jest.Mock).mockResolvedValue({ userId: 'customer', role: 'customer' });
  (prisma.$transaction as jest.Mock).mockImplementation(fn => fn(prisma));
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer', role: 'customer', supplierId: null, isBanned: false });
  (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: 'admin-1' }]);
  (prisma.supplier.findFirst as jest.Mock).mockResolvedValue(null);
  (prisma.supplier.create as jest.Mock).mockResolvedValue({ id: 'new-supplier', name: body.companyName, notes: body.productListCsv });
  (prisma.supplier.update as jest.Mock).mockResolvedValue({ id: 'own-supplier', name: body.companyName, notes: body.productListCsv, applicationStatus: 'pending' });
  (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 1 });
});

it('requires an authenticated account before saving supplier data', async () => {
  (verifyToken as jest.Mock).mockResolvedValue(null);
  expect((await POST(request())).status).toBe(401);
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

it('atomically saves the supplier, catalogue note and account link', async () => {
  expect((await POST(request())).status).toBe(201);
  expect(prisma.supplier.create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({
      notes: body.productListCsv,
      phone: body.phone,
      applicationStatus: 'pending',
      status: 'inactive',
    }),
  }));
  expect(prisma.user.updateMany).toHaveBeenCalledWith({
    where: { id: 'customer', supplierId: null },
    data: { supplierId: 'new-supplier', role: 'supplier' },
  });
  expect(prisma.notification.createMany).toHaveBeenCalledWith(expect.objectContaining({
    data: [expect.objectContaining({
      targetUserId: 'admin-1',
      link: '/admin/supplier-applications',
      title: 'New supplier application',
    })],
  }));
});

it('lets an already-linked pending supplier complete or correct the proposed catalogue', async () => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer', role: 'supplier', supplierId: 'own-supplier', isBanned: false });
  (prisma.supplier.findUnique as jest.Mock).mockResolvedValue({ id: 'own-supplier', name: 'Old name', applicationStatus: 'pending' });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(prisma.supplier.update).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: 'own-supplier' },
    data: expect.objectContaining({ notes: body.productListCsv, name: body.companyName }),
  }));
  expect(await response.json()).toMatchObject({ message: 'Supplier application updated' });
  expect(prisma.notification.createMany).toHaveBeenCalledWith(expect.objectContaining({
    data: [expect.objectContaining({ title: 'Supplier application updated' })],
  }));
});

it('does not rewrite an already-approved supplier through the registration form', async () => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer', role: 'supplier', supplierId: 'own-supplier', isBanned: false });
  (prisma.supplier.findUnique as jest.Mock).mockResolvedValue({ id: 'own-supplier', applicationStatus: 'approved' });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(prisma.supplier.update).not.toHaveBeenCalled();
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
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin', role: 'admin', supplierId: null, isBanned: false });
  expect((await POST(request())).status).toBe(201);
  expect(prisma.user.updateMany).toHaveBeenCalledWith({ where: { id: 'admin', supplierId: null }, data: { supplierId: 'new-supplier' } });
});

it('rejects malformed supplier details before starting a transaction', async () => {
  expect((await POST(request({ ...body, companyName: ' ', address: {} }))).status).toBe(400);
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

it('keeps the application successful if the admin notification channel is temporarily unavailable', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('notifications offline'));
  expect((await POST(request())).status).toBe(201);
  log.mockRestore();
});

it('returns a recoverable failure when saving the supplier link fails', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  (prisma.user.updateMany as jest.Mock).mockRejectedValue(new Error('offline'));
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect(JSON.stringify(await response.json())).not.toContain('offline');
  log.mockRestore();
});
