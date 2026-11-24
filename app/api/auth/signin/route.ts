import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { loginSchema, validateInput } from '@/lib/utils/validation';
import { setAuthCookies } from '@/lib/utils/cookies';
import prisma from '@/lib/prisma';
import { managedPasswordLogin, managedSessionResponse, managedError, supabaseAuthEnabled } from '@/lib/supabaseAuth';
import { withRateLimit } from '@/lib/utils/rateLimit';

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(loginSchema, body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    if (supabaseAuthEnabled()) {
      const { identifier, password } = validation.data!;
      const email = identifier.toLowerCase();
      const account = await prisma.user.findFirst({ where: { OR: [{ email: { equals: email, mode: 'insensitive' } }, { phoneNumber: identifier }] } });
      if (!account || account.supabaseAuthId) {
        try {
          if (!identifier.includes('@') || account?.isBanned) return NextResponse.json({ error: 'Invalid credentials. Use your email address.' }, { status: 401 });
          return await managedSessionResponse(await managedPasswordLogin(email, password), true);
        } catch (error) { return managedError(error); }
      }
    }
    // Login user
    const result = await authService.login(validation.data!);

    // Create response
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: result.user
      },
      { status: 200 }
    );

    // Set auth cookies
    setAuthCookies(response, result.accessToken, result.refreshToken);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to login
export const POST = withRateLimit(handleLogin, 'auth');
