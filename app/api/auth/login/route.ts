import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { loginSchema, validateInput } from '@/lib/utils/validation';
import { setAuthCookies } from '@/lib/utils/cookies';
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
      createdAt: user.createdAt
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
