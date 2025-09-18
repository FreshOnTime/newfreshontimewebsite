import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import EmailToken from '@/lib/models/EmailToken';
import bcrypt from 'bcryptjs';
import { isRateLimited, makeKey } from '@/lib/middleware/rateLimiter';
// ...existing code...

export const POST = async (request: NextRequest) => {
  try {
    await connectDB();
    const body = await request.json();
    const { token, password } = body || {};

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Rate limit per IP for reset attempts to prevent token brute force
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(makeKey('reset:ip', ip), 50, 1000 * 60 * 60)) {
      return NextResponse.json({ error: 'Too many reset attempts. Try again later.' }, { status: 429 });
    }

    // Find token record by verifying hash against stored hashes
    const tokens = await EmailToken.find({ type: 'reset', expiresAt: { $gt: new Date() } }).exec();
    let matched: (typeof tokens[number]) | null = null;
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash);
      if (match) { matched = t; break; }
    }

    if (!matched) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const user = await User.findById(matched.userId).exec();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // update password
    const passwordHash = await bcrypt.hash(password, 12);
    user.passwordHash = passwordHash;
    await user.save();

    // delete token
    await EmailToken.deleteOne({ _id: matched._id });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
