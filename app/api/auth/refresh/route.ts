import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
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

    // Generate new tokens
    const result = await authService.refreshToken(refreshToken);

    // Create response
    const response = NextResponse.json(
      { message: 'Tokens refreshed successfully' },
      { status: 200 }
    );

    // Set new auth cookies
    setAuthCookies(response, result.accessToken, result.refreshToken);

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    
    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
