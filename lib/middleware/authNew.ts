import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/jwt';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload & { _id: string };
}

type RouteHandler = (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>;

export function withAuth(
  handler: RouteHandler,
  options: {
    requiredRoles?: string[];
    optional?: boolean;
  } = {}
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      await connectDB();

      const accessToken = req.cookies.get('accessToken')?.value;

      if (!accessToken) {
        if (options.optional) {
          return handler(req as AuthenticatedRequest, ...args);
        }
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }

      let payload: TokenPayload;
      try {
        payload = verifyToken(accessToken);
      } catch {
        if (options.optional) {
          return handler(req as AuthenticatedRequest, ...args);
        }
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Verify user still exists and is not banned
      const user = await User.findOne({ userId: payload.userId });
      if (!user || user.isBanned) {
        return NextResponse.json(
          { error: 'User not found or banned' },
          { status: 401 }
        );
      }

      // Check role authorization
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        const userRoles = [user.role, ...(user.secondaryRoles || [])];
        const hasRequiredRole = options.requiredRoles.some(role =>
          userRoles.includes(role)
        );

        if (!hasRequiredRole) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = {
        ...payload,
        _id: user._id.toString()
      };

      return handler(req as AuthenticatedRequest, ...args);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

export function requireRoles(roles: string[]) {
  return (handler: RouteHandler) => {
    return withAuth(handler, { requiredRoles: roles });
  };
}

export function optionalAuth(handler: RouteHandler) {
  return withAuth(handler, { optional: true });
}
