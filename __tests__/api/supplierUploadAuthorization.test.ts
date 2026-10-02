import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/suppliers/upload/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/auth', () => ({ requireAuth: (handler: unknown) => handler }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { user: { findUnique: jest.fn(), update: jest.fn() }, supplier: { findFirst: jest.fn() } } }));
jest.mock('@/lib/services/mailService', () => ({ sendEmail: jest.fn() }));
it('requires an existing account link and does not auto-claim a supplier during upload', async () => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer', email: 'supplier@example.com', phoneNumber: '0771234567', supplierId: null });
  const request = { user: { userId: 'customer' }, headers: new Headers() } as unknown as NextRequest;
  expect((await POST(request, undefined)).status).toBe(403);
  expect(prisma.supplier.findFirst).not.toHaveBeenCalled();
  expect(prisma.user.update).not.toHaveBeenCalled();
});
