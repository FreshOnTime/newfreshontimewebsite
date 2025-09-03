import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/authNew';
import User from '@/lib/models/User';

async function handleMe(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Fetch the latest user data from DB to ensure role and profile are up to date
    const dbUser = await User.findOne({ userId: req.user.userId });
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userObj = dbUser.toObject();
    // Remove sensitive fields
    delete userObj.passwordHash;
    delete userObj.refreshTokens;

    return NextResponse.json(
      {
        message: 'User retrieved successfully',
        user: userObj,
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
