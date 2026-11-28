import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { signupSchema, validateInput } from '@/lib/utils/validation';
import { setAuthCookies } from '@/lib/utils/cookies';
import crypto from 'crypto';
import { businessNameSchema } from '@/lib/businessOnboarding';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/services/mailService';
import { managedSignupSchema, startManagedSignup, managedError, supabaseAuthEnabled } from '@/lib/supabaseAuth';
import { withRateLimit } from '@/lib/utils/rateLimit';

async function handleSignup(request: NextRequest) {
  try {
    const body = await request.json();

    if (supabaseAuthEnabled()) {
      const managed = managedSignupSchema.safeParse(body);
      if (!managed.success) return NextResponse.json({ error: managed.error.issues[0]?.message || 'Invalid registration' }, { status: 400 });
      try {
        await startManagedSignup(managed.data);
        return NextResponse.json({ verificationRequired: true, message: 'Check your email to verify your account.' }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
      } catch (error) { return managedError(error); }
    }
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
    const businessName = businessNameSchema.optional().safeParse(body.businessName);
    if (!businessName.success) return NextResponse.json({error:'Enter a valid business name'}, {status:400});
    const result = await authService.signup({...validation.data!, ...(businessName.data?{businessName:businessName.data}:{})});

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

    try {
      // create verification token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(rawToken, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

      await prisma.emailToken.create({
        data: {
          userId: result.user._id,
          tokenHash,
          type: 'verify',
          expiresAt,
        },
      });

      // send verification email (non-blocking)
      if (result.user.email) {
        await sendVerificationEmail(result.user.email, rawToken).catch((e) => console.error('sendVerificationEmail error', e));
      }
    } catch (e) {
      console.error('Failed to create/send verification token', e);
    }

    return response;
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'An account with these details already exists' }, { status: 409 });

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
