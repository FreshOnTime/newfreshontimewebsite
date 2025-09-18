import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import EmailToken from '@/lib/models/EmailToken';
import bcrypt from 'bcryptjs';

export const GET = async (request: NextRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    const tokens = await EmailToken.find({ type: 'verify', expiresAt: { $gt: new Date() } }).exec();
    let matched: (typeof tokens[number]) | null = null;
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash);
      if (match) { matched = t; break; }
    }

    if (!matched) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

    const user = await User.findById(matched.userId).exec();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.isEmailVerified = true;
    await user.save();

    await EmailToken.deleteOne({ _id: matched._id });

    return NextResponse.json({ message: 'Email verified' });
  } catch (error) {
    console.error('Email verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
