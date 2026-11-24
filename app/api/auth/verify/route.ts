import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { managedVerify, managedUser, managedError, supabaseAuthEnabled } from '@/lib/supabaseAuth';
import { isRateLimited, makeKey } from '@/lib/middleware/rateLimiter';

export async function POST(request: NextRequest) {
  if (!supabaseAuthEnabled()) return NextResponse.json({ error: 'Verification temporarily unavailable' }, { status: 503 });
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(makeKey('supabase-verify', ip), 20, 600000)) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (typeof body?.token !== 'string' || !body.token || body.token.length > 1024) return NextResponse.json({ error: 'Invalid verification link' }, { status: 400 });
  try {
    await managedUser(await managedVerify(body.token, 'email'), true);
    return NextResponse.json({ message: 'Your email is verified. You can sign in now.' });
  } catch (error) { return managedError(error); }
}

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    const tokens = await prisma.emailToken.findMany({ where: { type: 'verify', expiresAt: { gt: new Date() } } });
    let matched: (typeof tokens[number]) | null = null;
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash);
      if (match) { matched = t; break; }
    }

    if (!matched) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: matched.userId } });
    if (!user || user.supabaseAuthId) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });

    await prisma.emailToken.delete({ where: { id: matched.id } });

    return NextResponse.json({ message: 'Email verified' });
  } catch (error) {
    console.error('Email verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
