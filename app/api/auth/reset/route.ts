import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { passwordSchema } from '@/lib/utils/validation';
import { isRateLimited, makeKey } from '@/lib/middleware/rateLimiter';

const resetSchema = z.object({ token: z.string().min(1).max(1024), password: passwordSchema });

export const POST = async (request: NextRequest) => {
  try {
    const parsed = resetSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Check the reset link and password' }, { status: 400 });
    const { token, password } = parsed.data;

    // Rate limit per IP for reset attempts to prevent token brute force
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(makeKey('reset:ip', ip), 50, 1000 * 60 * 60)) {
      return NextResponse.json({ error: 'Too many reset attempts. Try again later.' }, { status: 429 });
    }

    // Find token record by verifying hash against stored hashes
    const tokens = await prisma.emailToken.findMany({ where: { type: 'reset', expiresAt: { gt: new Date() } } });
    let matched: (typeof tokens[number]) | null = null;
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash);
      if (match) { matched = t; break; }
    }

    if (!matched) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: matched.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Consume the reset token and change the password in one transaction. A
    // concurrent retry cannot reuse the link or leave a half-completed reset.
    const reset = await prisma.$transaction(async tx => {
      const consumed = await tx.emailToken.deleteMany({ where: { id: matched.id, type: 'reset', expiresAt: { gt: new Date() } } });
      if (consumed.count !== 1) return false;
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      return true;
    });
    if (!reset) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
