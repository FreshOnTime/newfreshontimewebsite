import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirebaseAdminAuth } from '@/lib/config/firebaseAdmin';
import { authService } from '@/lib/services/authService';
import { setAuthCookies } from '@/lib/utils/cookies';
import { withRateLimit } from '@/lib/utils/rateLimit';

const googleTokenSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

async function handleGoogleLogin(request: NextRequest) {
  try {
    const parsed = googleTokenSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'A Google ID token is required' }, { status: 400 });
    }

    const decoded = await getFirebaseAdminAuth().verifyIdToken(parsed.data.idToken);
    const provider = decoded.firebase?.sign_in_provider;
    if (provider !== 'google.com' || !decoded.email || !decoded.email_verified) {
      return NextResponse.json({ error: 'A verified Google account is required' }, { status: 401 });
    }

    const result = await authService.loginWithGoogle({
      providerAccountId: decoded.uid,
      email: decoded.email.toLowerCase(),
      name: decoded.name,
    });
    const response = NextResponse.json({ message: 'Google sign-in successful', user: result.user });
    setAuthCookies(response, result.accessToken, result.refreshToken);
    return response;
  } catch (error) {
    console.error('Google sign-in error:', error);
    const message = error instanceof Error && error.message === 'Account is banned'
      ? error.message
      : 'Google sign-in could not be completed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export const POST = withRateLimit(handleGoogleLogin, 'auth');
