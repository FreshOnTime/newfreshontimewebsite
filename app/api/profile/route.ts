import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function normalizeOptional(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function PATCH(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(accessToken);
    } catch {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    if (payload.type !== 'access') {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = normalizeOptional(body.lastName);
    const email = normalizeOptional(body.email)?.toLowerCase() || null;
    const phoneNumber = normalizeOptional(body.phoneNumber);

    if (!firstName) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }

    if (!email && !phoneNumber) {
      return NextResponse.json({ error: 'Keep at least an email or phone number on your account' }, { status: 400 });
    }

    const collisions = await prisma.user.findFirst({
      where: {
        id: { not: payload.userId },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
      select: { id: true },
    });

    if (collisions) {
      return NextResponse.json({ error: 'That email or phone number is already used by another account' }, { status: 409 });
    }

    const current = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, phoneNumber: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        ...(email !== current.email ? { isEmailVerified: false } : {}),
        ...(phoneNumber !== current.phoneNumber ? { isPhoneVerified: false } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated',
      user: {
        ...updated,
        _id: updated.id,
        userId: updated.id,
      },
    });
  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json({ error: 'Unable to update profile right now' }, { status: 500 });
  }
}
