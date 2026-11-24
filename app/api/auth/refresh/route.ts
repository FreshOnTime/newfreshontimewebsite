import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { managedRefresh, managedRefreshPrefix, managedSessionResponse, managedError, supabaseAuthEnabled } from '@/lib/supabaseAuth';
import { setAuthCookies } from '@/lib/utils/cookies';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 401 }
      );
    }

    if (refreshToken.startsWith(managedRefreshPrefix)) {
      if (!supabaseAuthEnabled()) return NextResponse.json({ error: 'Authentication temporarily unavailable' }, { status: 503 });
      try { return await managedSessionResponse(await managedRefresh(refreshToken.slice(managedRefreshPrefix.length))); }
      catch (error) { return managedError(error); }
    }
    // Attempt to refresh tokens
    try {
      const result = await authService.refreshToken(refreshToken);

      // Create response
      const response = NextResponse.json(
        { message: 'Tokens refreshed successfully' },
        { status: 200 }
      );

      // Set new auth cookies
      setAuthCookies(response, result.accessToken, result.refreshToken);

      return response;
    } catch (innerErr: unknown) {
      // Log additional debug info without exposing raw tokens
      console.error('Refresh token validation failed for request.');
      throw innerErr;
    }
  } catch (error) {
  const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as Error).message : String(error);
  console.error('Refresh token error:', errMsg);

    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
