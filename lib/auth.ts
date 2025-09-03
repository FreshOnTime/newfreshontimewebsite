import { NextRequest, NextResponse } from 'next/server';
import { verifyToken as verifyAccessToken } from '@/lib/jwt';
import User from '@/lib/models/User';
import connectDB from '@/lib/database';
// Note: This legacy auth helper is kept for API routes using requireAuth.

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    mongoId?: string;
  };
}

type DecodedJwt = { userId: string; email?: string; role: string; type?: 'access' | 'refresh'; [k: string]: unknown };

export async function verifyToken(request: NextRequest) {
  try {
    // Support Authorization header Bearer token and cookie-based accessToken
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('accessToken')?.value ||
      request.headers.get('cookie')
        ?.split(';')
        ?.find(c => c.trim().startsWith('accessToken='))
        ?.split('=')[1];

    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return null;
    }
    
    let decoded: DecodedJwt;
    try {
      decoded = verifyAccessToken(token) as unknown as DecodedJwt;
    } catch {
      return null;
    }

    // Only accept access tokens
    if (decoded.type && decoded.type !== 'access') {
      return null;
    }

    await connectDB();

    // Verify user exists and is not banned (schema has isBanned, not isActive)
    const user = await User.findOne({ userId: decoded.userId });
    if (!user || user.isBanned) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      mongoId: user._id?.toString?.()
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Function without generics to simplify typing
export function requireAuth(handler: (
  request: NextRequest & { user?: { userId: string; email: string; role: string; mongoId?: string } }, 
  context: any
) => Promise<NextResponse> | Promise<Response>) {
  return async (request: NextRequest, context: any) => {
    const user = await verifyToken(request);
    
    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user to request
  (request as AuthenticatedRequest).user = { ...user, email: user.email || '' };
    
  return handler(request as NextRequest & { user?: { userId: string; email: string; role: string; mongoId?: string } }, context);
  };
}

export function requireAdmin(handler: (
  request: NextRequest & { user?: { userId: string; email: string; role: string; mongoId?: string } }, 
  context: any
) => Promise<NextResponse> | Promise<Response>) {
  return async (request: NextRequest, context: any) => {
    const user = await verifyToken(request);
    
    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Add user to request
  (request as AuthenticatedRequest).user = { ...user, email: user.email || '' };
    
  return handler(request as NextRequest & { user?: { userId: string; email: string; role: string; mongoId?: string } }, context);
  };
}
