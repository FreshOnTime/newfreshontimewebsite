import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import EmailToken from '@/lib/models/EmailToken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/services/mailService';
import { isRateLimited, makeKey } from '@/lib/middleware/rateLimiter';

export const POST = async (request: NextRequest) => {
  try {
    await connectDB();
    const body = await request.json();
    const email = body?.email?.toLowerCase?.();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Rate limit: limit per email to 3 per hour, and per-IP to 20 per hour
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(makeKey('forgot:email', email), 3, 1000 * 60 * 60)) {
      return NextResponse.json({ error: 'Too many password reset requests for this email. Try again later.' }, { status: 429 });
    }
    if (isRateLimited(makeKey('forgot:ip', ip), 20, 1000 * 60 * 60)) {
      return NextResponse.json({ error: 'Too many requests from this network. Try again later.' }, { status: 429 });
    }

    const user = await User.findOne({ email }).exec();

    // Always respond with a success message to avoid leaking which emails exist
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await EmailToken.create({ userId: user._id, tokenHash, type: 'reset', expiresAt });

    // send reset email (non-blocking)
    sendPasswordResetEmail(user.email as string, rawToken).catch((e) => console.error('sendPasswordResetEmail error', e));

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
