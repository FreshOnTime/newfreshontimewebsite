import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { clearAuthCookies } from '@/lib/utils/cookies';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      // Remove the refresh token from database
      await authService.logout(refreshToken);
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear auth cookies
    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we should clear the cookies
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    clearAuthCookies(response);
    return response;
  }
}
