import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import AuditLog from '@/lib/models/AuditLog';
import { verifyToken, TokenPayload } from '@/lib/jwt';

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName?: string;
}

export interface AdminRequest extends NextRequest {
  user?: AdminUser;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Verify JWT token from HTTP-only cookie
 */
export async function verifyAdminToken(cookieToken?: string): Promise<AdminUser | null> {
  try {
    await connectDB();
    
    if (!cookieToken) {
      return null;
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyToken(cookieToken);
    } catch {
      return null;
    }

    // Only accept access tokens for admin APIs
    if (decoded.type !== 'access') {
      return null;
    }

    // Verify user still exists and has admin role
    const user = await User.findOne({ userId: decoded.userId });
    if (!user || user.isBanned) {
      return null;
    }

    // Check if user has admin role
    if (user.role !== 'admin' && !user.secondaryRoles?.includes('admin')) {
      return null;
    }

    return {
      userId: user._id.toString(),
      email: user.email || '',
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  } catch (error) {
    console.error('Admin token verification error:', error);
    return null;
  }
}

/**
 * Middleware to require admin authentication
 */
export function requireAdmin<T extends Record<string, string>>(
  handler: (req: AdminRequest, context: { params: T }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: T }) => {
    try {
      // Prefer NextRequest cookies API; fallback to header parsing
      const cookieToken = request.cookies.get('accessToken')?.value ||
        request.headers.get('cookie')
          ?.split(';')
          ?.find(c => c.trim().startsWith('accessToken='))
          ?.split('=')[1];
      
      const user = await verifyAdminToken(cookieToken);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Add user to request
      (request as AdminRequest).user = user;

      return await handler(request as AdminRequest, context);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Log admin actions for audit trail
 */
export async function logAuditAction(
  userId: string,
  action: string,
  resourceType: 'user' | 'customer' | 'supplier' | 'category' | 'product' | 'order' | 'auth',
  resourceId?: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>,
  request?: NextRequest
) {
  try {
    await connectDB();
    
    const ip = request?.headers.get('x-forwarded-for') || 
               request?.headers.get('x-real-ip') || 
               'unknown';
    
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await AuditLog.create({
      userId,
      action,
      resourceType,
      resourceId: resourceId ? resourceId : undefined,
      before,
      after,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging shouldn't break the main operation
  }
}

/**
 * Helper to get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

/**
 * Rate limiting helper (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Validate request origin (basic CSRF protection)
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // For same-site requests, origin might be null
  if (!origin && !referer) {
    return false;
  }

  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`,
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  return allowedOrigins.some(allowed => 
    origin === allowed || referer?.startsWith(allowed + '/')
  );
}
