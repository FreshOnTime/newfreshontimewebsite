import { groupSupplierItems, createSupplierOrders, supplierTransition } from '@/lib/services/supplierOrderService';
import { GET, PATCH } from '@/app/api/suppliers/orders/route';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/services/mailService';
import type { NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/services/mailService', () => ({ sendEmail: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { user: { findUnique: jest.fn() }, supplierOrder: { findMany: jest.fn(), findFirst: jest.fn(), updateMany: jest.fn() }, $transaction: jest.fn() } }));
const db = prisma as unknown as { user: { findUnique: jest.Mock }; supplierOrder: { findMany: jest.Mock; findFirst: jest.Mock; updateMany: jest.Mock }; $transaction: jest.Mock };
const lines = [
  { supplierId: 'a', productId: '1', sku: 'APPLE', name: 'Apple', qty: 2 },
  { supplierId: 'b', productId: '2', sku: 'CARROT', name: 'Carrot', qty: 3 },
  { supplierId: 'a', productId: '3', sku: 'PEAR', name: 'Pear', qty: 1 },
  { productId: '4', sku: 'RICE', name: 'Rice', qty: 4 },
];
const request = (body: unknown = {}, role = 'supplier') => ({ url: 'https://freshpick.lk/api/suppliers/orders', user: { userId: 'user-a', role }, json: async () => body }) as unknown as NextRequest;

beforeEach(() => {
  jest.clearAllMocks();
  db.user.findUnique.mockResolvedValue({ supplier: { id: 'a', status: 'active', applicationStatus: 'approved' } });
  db.$transaction.mockImplementation(callback => callback(db));
  db.supplierOrder.findMany.mockResolvedValue([]);
  db.supplierOrder.findFirst.mockResolvedValue({ status: 'pending' });
  db.supplierOrder.updateMany.mockResolvedValue({ count: 1 });
});

it('splits only assigned products and never includes retail prices or other supplier items', () => {
  const groups = groupSupplierItems(lines);
  expect([...groups.keys()]).toEqual(['a', 'b']);
  expect(groups.get('a')).toEqual([{ productId: '1', sku: 'APPLE', name: 'Apple', qty: 2 }, { productId: '3', sku: 'PEAR', name: 'Pear', qty: 1 }]);
});
it('creates a single request per supplier and privately notifies verified supplier accounts', async () => {
  const tx = { supplier: { findMany: jest.fn().mockResolvedValue([
    { id: 'a', status: 'active', applicationStatus: 'approved', products: [{ id: 'user-a', email: 'a@example.com', isEmailVerified: true }] },
    { id: 'b', status: 'inactive', applicationStatus: 'approved', products: [{ id: 'user-b', email: 'b@example.com', isEmailVerified: true }] },
  ]) }, supplierOrder: { createMany: jest.fn().mockResolvedValue({ count: 1 }) }, notification: { create: jest.fn() } };
  await createSupplierOrders(tx as unknown as Prisma.TransactionClient, { id: 'o', orderNumber: 'ORD-1' }, lines);
  expect(tx.supplierOrder.createMany).toHaveBeenCalledTimes(2);
  expect(tx.notification.create).toHaveBeenCalledTimes(1);
  expect(tx.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ targetUserId: 'user-a' }) });
  expect(sendEmail).toHaveBeenCalledTimes(1);
  tx.supplierOrder.createMany.mockResolvedValue({ count: 0 });
  await createSupplierOrders(tx as unknown as Prisma.TransactionClient, { id: 'o', orderNumber: 'ORD-1' }, lines);
  expect(sendEmail).toHaveBeenCalledTimes(1);
});
it('does not touch partner tables when no supplier is linked', async () => {
  await expect(createSupplierOrders({} as Prisma.TransactionClient, { id: 'o', orderNumber: 'ORD-1' }, [lines[3]])).resolves.toBeUndefined();
});
it('lists orders scoped to the authenticated supplier and rejects customers and unapproved suppliers', async () => {
  expect((await GET(request(), undefined)).status).toBe(200);
  expect(db.supplierOrder.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { supplierId: 'a' } }));
  expect((await GET(request({}, 'customer'), undefined)).status).toBe(403);
  db.user.findUnique.mockResolvedValue({ supplier: { id: 'a', status: 'active', applicationStatus: 'pending' } });
  expect((await GET(request(), undefined)).status).toBe(403);
});
it('rejects foreign IDs and invalid transitions; updates are conditional on current order status', async () => {
  db.supplierOrder.findFirst.mockResolvedValueOnce(null);
  expect((await PATCH(request({ id: 'foreign', action: 'accept' }), undefined)).status).toBe(404);
  expect(db.supplierOrder.updateMany).not.toHaveBeenCalled();
  expect((await PATCH(request({ id: 'own', action: 'ready' }), undefined)).status).toBe(409);
  expect((await PATCH(request({ id: 'own', action: 'accept' }), undefined)).status).toBe(200);
  expect(db.supplierOrder.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ supplierId: 'a', status: 'pending', order: { status: expect.objectContaining({ notIn: expect.arrayContaining(['cancelled', 'refunded']) }) } }), data: { status: 'accepted' } }));
  expect(supplierTransition('accepted','ready')).toBe('ready');
  expect(supplierTransition('collected','accept')).toBeNull();
});
