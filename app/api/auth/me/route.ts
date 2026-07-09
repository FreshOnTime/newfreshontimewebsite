import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/authNew';
import prisma from '@/lib/prisma';

async function handleMe(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Fetch the latest user data from DB to ensure role and profile are up to date
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { addresses: true },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
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

export const GET = withAuth(handleMe);
