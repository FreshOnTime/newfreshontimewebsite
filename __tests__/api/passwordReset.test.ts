import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/reset/route';
import prisma from '@/lib/prisma';

jest.mock('bcryptjs', () => ({ compare: jest.fn().mockResolvedValue(true), hash: jest.fn().mockResolvedValue('new-hash') }));
jest.mock('@/lib/middleware/rateLimiter', () => ({ isRateLimited: () => false, makeKey: () => 'reset' }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { $transaction: jest.fn(), emailToken: { findMany: jest.fn(), deleteMany: jest.fn() }, user: { findUnique: jest.fn(), update: jest.fn() }, refreshToken: { deleteMany: jest.fn() } } }));
const request = (password: unknown) => ({ json: async () => ({ token: 'valid-reset-token', password }), headers: new Headers() }) as NextRequest;
beforeEach(() => {
  jest.clearAllMocks();
  (prisma.$transaction as jest.Mock).mockImplementation(fn => fn(prisma));
  (prisma.emailToken.findMany as jest.Mock).mockResolvedValue([{ id: 'reset-id', userId: 'customer', tokenHash: 'stored-hash' }]);
  (prisma.emailToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'customer' });
});
it.each(['short', 'alllowercase1', 'ALLUPPERCASE1', 'NoNumbersHere', 123456789])('rejects invalid reset password before token lookup: %s', async password => {
  expect((await POST(request(password))).status).toBe(400);
  expect(prisma.emailToken.findMany).not.toHaveBeenCalled();
});
it('changes the password, consumes the token and revokes refresh sessions in the same transaction', async () => {
  expect((await POST(request('StrongPassword1'))).status).toBe(200);
  expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  expect(prisma.emailToken.deleteMany).toHaveBeenCalledWith({ where: { id: 'reset-id', type: 'reset', expiresAt: { gt: expect.any(Date) } } });
  expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'customer' }, data: { passwordHash: 'new-hash' } });
  expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'customer' } });
});
it('cannot reuse a consumed or expired token in a concurrent reset', async () => {
  (prisma.emailToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
  expect((await POST(request('StrongPassword1'))).status).toBe(400);
  expect(prisma.user.update).not.toHaveBeenCalled();
  expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
});
