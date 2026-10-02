import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/users/register/route';
import { authService } from '@/lib/services/authService';
jest.mock('@/lib/services/authService', () => ({ authService: { signup: jest.fn() } }));
jest.mock('@/lib/utils/cookies', () => ({ setAuthCookies: jest.fn() }));
const data = { firstName: 'Customer', phoneNumber: '0771234567', password: 'StrongPass1', registrationAddress: { addressLine1: 'Market Road', city: 'Colombo', province: 'Western', postalCode: '00100', country: 'LK' } };
const request = (body: unknown) => ({ headers: new Headers(), json: async () => body }) as NextRequest;
beforeEach(() => { jest.clearAllMocks(); (authService.signup as jest.Mock).mockResolvedValue({ user: { _id: 'generated-id' }, accessToken: 'access', refreshToken: 'refresh' }); });
it('rejects passwordless legacy provisioning before account creation', async () => {
  expect((await POST(request({ userId: 'chosen-id', firstName: 'Customer', phoneNumber: '0771234567', registrationAddress: {} }))).status).toBe(400);
  expect(authService.signup).not.toHaveBeenCalled();
});
it('uses normal signup and strips caller-selected account IDs and roles', async () => {
  expect((await POST(request({ ...data, userId: 'chosen-id', id: 'chosen-id', role: 'admin' }))).status).toBe(201);
  expect(authService.signup).toHaveBeenCalledWith(data);
});
