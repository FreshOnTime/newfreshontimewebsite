import { NextRequest } from 'next/server';

const verifyIdToken = jest.fn();
const loginWithGoogle = jest.fn();
const setAuthCookies = jest.fn();

jest.mock('@/lib/config/firebaseAdmin', () => ({
  getFirebaseAdminAuth: () => ({ verifyIdToken }),
}));

jest.mock('@/lib/services/authService', () => ({
  authService: { loginWithGoogle },
}));

jest.mock('@/lib/utils/cookies', () => ({ setAuthCookies }));

describe('POST /api/auth/google', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies a Google token, creates a site session, and links the account', async () => {
    const { POST } = await import('@/app/api/auth/google/route');
    verifyIdToken.mockResolvedValue({
      uid: 'google-subject',
      email: 'customer@example.com',
      email_verified: true,
      name: 'Customer Example',
      firebase: { sign_in_provider: 'google.com' },
    });
    loginWithGoogle.mockResolvedValue({
      user: { userId: 'user-1', firstName: 'Customer', phoneNumber: '', role: 'customer' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const response = await POST({
      headers: new Headers(),
      json: async () => ({ idToken: 'firebase-id-token' }),
    } as unknown as NextRequest);

    expect(verifyIdToken).toHaveBeenCalledWith('firebase-id-token');
    expect(loginWithGoogle).toHaveBeenCalledWith({
      providerAccountId: 'google-subject',
      email: 'customer@example.com',
      name: 'Customer Example',
    });
    expect(setAuthCookies).toHaveBeenCalledWith(response, 'access-token', 'refresh-token');
    expect(response.status).toBe(200);
  });

  it('rejects tokens that did not come from a verified Google account', async () => {
    const { POST } = await import('@/app/api/auth/google/route');
    verifyIdToken.mockResolvedValue({
      uid: 'not-google',
      email: 'customer@example.com',
      email_verified: true,
      firebase: { sign_in_provider: 'password' },
    });

    const response = await POST({
      headers: new Headers(),
      json: async () => ({ idToken: 'firebase-id-token' }),
    } as unknown as NextRequest);

    expect(response.status).toBe(401);
    expect(loginWithGoogle).not.toHaveBeenCalled();
  });
});
