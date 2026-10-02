import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/signup/route';
import { authService } from '@/lib/services/authService';

jest.mock('@/lib/services/authService', () => ({ authService: { signup: jest.fn() } }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { emailToken: { create: jest.fn() } } }));
jest.mock('@/lib/utils/cookies', () => ({ setAuthCookies: jest.fn() }));
jest.mock('@/lib/utils/rateLimit', () => ({ withRateLimit: (handler: unknown) => handler }));
jest.mock('@/lib/services/mailService', () => ({ sendVerificationEmail: jest.fn().mockResolvedValue(undefined) }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('token-hash') }));
const body = { firstName: 'Customer', phoneNumber: '0771234567', password: 'StrongPassword1', registrationAddress: { addressLine1: 'Market Road', city: 'Colombo', province: 'Western', postalCode: '00100', country: 'Sri Lanka' } };
const request = { json: async () => body } as NextRequest;
beforeEach(() => { jest.clearAllMocks(); });
it('never writes a signup password into console output', async () => {
  const output = jest.spyOn(console, 'log').mockImplementation(() => {});
  (authService.signup as jest.Mock).mockResolvedValue({ user: { _id: 'new-customer' }, accessToken: 'access', refreshToken: 'refresh' });
  expect((await POST(request)).status).toBe(201);
  expect(JSON.stringify(output.mock.calls)).not.toContain(body.password);
  output.mockRestore();
});
it('returns a useful conflict if a concurrent signup hits a unique constraint', async () => {
  const output = jest.spyOn(console, 'error').mockImplementation(() => {});
  (authService.signup as jest.Mock).mockRejectedValue({ code: 'P2002' });
  expect((await POST(request)).status).toBe(409);
  output.mockRestore();
});
it('rejects malformed JSON as a client error', async () => {
  const output = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect((await POST({ json: async () => { throw new SyntaxError('malformed JSON'); } } as unknown as NextRequest)).status).toBe(400);
  expect(authService.signup).not.toHaveBeenCalled();
  output.mockRestore();
});
