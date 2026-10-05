import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/utils/cookies';

jest.mock('@/lib/services/authService', () => ({
  authService: {
    login: jest.fn(),
    refreshToken: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/lib/utils/cookies', () => ({
  setAuthCookies: jest.fn(),
  clearAuthCookies: jest.fn(),
}));

jest.mock('@/lib/utils/rateLimit', () => ({
  withRateLimit: (handler: unknown) => handler,
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
  },
}));

jest.mock('@/lib/jwt', () => ({
  verifyToken: jest.fn(),
}));

describe('native mobile auth compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.login as jest.Mock).mockResolvedValue({
      user: { _id: 'user-1', userId: 'user-1', firstName: 'Savi' },
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
    (authService.refreshToken as jest.Mock).mockResolvedValue({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });
    (verifyToken as jest.Mock).mockReturnValue({
      userId: 'user-1',
      email: 'savi@example.com',
      role: 'customer',
      type: 'access',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'savi@example.com',
      role: 'customer',
      secondaryRoles: [],
      isBanned: false,
    });
  });

  it('returns tokens only to an explicitly identified native sign-in client', async () => {
    const { POST } = await import('@/app/api/auth/signin/route');

    const mobile = await POST(new NextRequest('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-freshpick-client': 'mobile',
      },
      body: JSON.stringify({ identifier: 'savi@example.com', password: 'Password1' }),
    }));
    expect(mobile.status).toBe(200);
    expect(await mobile.json()).toMatchObject({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { _id: 'user-1' },
    });

    const web = await POST(new NextRequest('http://localhost/api/auth/signin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: 'savi@example.com', password: 'Password1' }),
    }));
    expect(web.status).toBe(200);
    const webBody = await web.json();
    expect(webBody.accessToken).toBeUndefined();
    expect(webBody.refreshToken).toBeUndefined();
    expect(setAuthCookies).toHaveBeenCalled();
  });

  it('rotates a refresh token from the mobile JSON body and returns the new pair', async () => {
    const { POST } = await import('@/app/api/auth/refresh/route');
    const response = await POST(new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-freshpick-client': 'mobile',
      },
      body: JSON.stringify({ refreshToken: 'refresh-1' }),
    }));

    expect(response.status).toBe(200);
    expect(authService.refreshToken).toHaveBeenCalledWith('refresh-1');
    expect(await response.json()).toMatchObject({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });
  });

  it('accepts a Bearer access token in shared protected-route middleware', async () => {
    const { withAuth } = await import('@/lib/middleware/auth');
    const handler = jest.fn(async () => NextResponse.json({ ok: true }));
    const protectedHandler = withAuth(handler);

    const response = await protectedHandler(new NextRequest('http://localhost/api/notifications', {
      headers: { authorization: 'Bearer native-access-token' },
    }));

    expect(response.status).toBe(200);
    expect(verifyToken).toHaveBeenCalledWith('native-access-token');
    expect(handler).toHaveBeenCalled();
    const authenticatedRequest = handler.mock.calls[0][0] as { user?: { _id?: string; userId?: string } };
    expect(authenticatedRequest.user).toMatchObject({ _id: 'user-1', userId: 'user-1' });
  });
});
