import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { signupSchema, validateInput } from '@/lib/utils/validation';
import { setAuthCookies } from '@/lib/utils/cookies';
import { withRateLimit } from '@/lib/utils/rateLimit';

async function handleSignup(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Signup request body:', JSON.stringify(body, null, 2));

    // Validate input
    const validation = validateInput(signupSchema, body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Create user
    const result = await authService.signup(validation.data!);

    // Create response
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: result.user
      },
      { status: 201 }
    );

    // Set auth cookies
    setAuthCookies(response, result.accessToken, result.refreshToken);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to signup
export const POST = withRateLimit(handleSignup, 'auth');
