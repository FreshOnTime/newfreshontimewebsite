import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const canRefresh = Boolean(req.cookies.get('refreshToken')?.value);
  const unauthenticated = () => NextResponse.json(
    { error: 'User not authenticated', canRefresh },
    { status: 401 }
  );

  try {
    const accessToken = req.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return unauthenticated();
    }

    let payload;
    try {
      payload = verifyToken(accessToken);
    } catch {
      return unauthenticated();
    }

    if (payload.type !== 'access') {
      return unauthenticated();
    }

    // This is the only database query for /api/auth/me. Previously withAuth
    // queried the user and this handler queried the same user again.
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { addresses: true },
    });
    if (!dbUser || dbUser.isBanned) {
      return unauthenticated();
    }

    const reg = dbUser.addresses.find((a) => a.isRegistration) || dbUser.addresses[0];

    // Shape mirrors the previous Mongo document (minus sensitive fields) so the
    // client AuthContext keeps working unchanged.
    const user = {
      _id: dbUser.id,
      userId: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      phoneNumber: dbUser.phoneNumber,
      role: dbUser.role,
      secondaryRoles: dbUser.secondaryRoles,
      supplierId: dbUser.supplierId,
      isEmailVerified: dbUser.isEmailVerified,
      isPhoneVerified: dbUser.isPhoneVerified,
      giftCardBalance: Number(dbUser.giftCardBalance),
      registrationAddress: reg
        ? {
            recipientName: reg.recipientName,
            streetAddress: reg.streetAddress,
            streetAddress2: reg.streetAddress2 || undefined,
            town: reg.town,
            city: reg.city,
            state: reg.state,
            postalCode: reg.postalCode,
            countryCode: reg.countryCode,
            phoneNumber: reg.phoneNumber,
            type: reg.type,
          }
        : undefined,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };

    return NextResponse.json(
      {
        message: 'User retrieved successfully',
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
