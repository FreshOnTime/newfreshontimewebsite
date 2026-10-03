import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, TokenPayload } from '@/lib/jwt';
import { adminDataError } from '@/lib/adminApiErrors';

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
    return await authenticateAdmin(cookieToken);
  } catch (error) {
    if (error instanceof AuthError) return null;
    throw error;
  }
}

async function authenticateAdmin(cookieToken?: string): Promise<AdminUser> {
  if (!cookieToken) throw new AuthError('Sign in to access administration.', 401);
  let decoded: TokenPayload;
  try {
    decoded = verifyToken(cookieToken);
  } catch {
    throw new AuthError('Your session has expired. Sign in again.', 401);
  }
  if (decoded.type !== 'access') throw new AuthError('An access session is required.', 401);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, firstName: true, lastName: true, isBanned: true, secondaryRoles: true },
  });
  if (!user) throw new AuthError('Your account session is no longer available.', 401);
  if (user.isBanned || (user.role !== 'admin' && !user.secondaryRoles?.includes('admin'))) {
    throw new AuthError('Admin access required', 403);
  }
  return { userId: user.id, email: user.email || '', role: user.role, firstName: user.firstName, lastName: user.lastName || undefined };
}

function adminFailure(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, {
    status: error.statusCode, headers: { 'Cache-Control': 'private, no-store' },
  });
  return adminDataError(error, 'Unable to load admin data. Please try again.');
}

/**
 * Middleware to require admin authentication
 */
export function requireAdmin<T extends Record<string, string>>(
  handler: (req: AdminRequest, context: { params: Promise<T> }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    try {
      // Prefer NextRequest cookies API; fallback to header parsing
      const cookieToken = request.cookies.get('accessToken')?.value ||
        request.headers.get('cookie')
          ?.split(';')
          ?.find(c => c.trim().startsWith('accessToken='))
          ?.split('=')[1];

      const user = await authenticateAdmin(cookieToken);

      // Add user to request
      (request as AdminRequest).user = user;

      return await handler(request as AdminRequest, context);
    } catch (error) {
      return adminFailure(error);
    }
  };
}

// For routes without parameters
export function requireAdminSimple(
  handler: (req: AdminRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Prefer NextRequest cookies API; fallback to header parsing
      const cookieToken = request.cookies.get('accessToken')?.value ||
        request.headers.get('cookie')
          ?.split(';')
          ?.find(c => c.trim().startsWith('accessToken='))
          ?.split('=')[1];

      const user = await authenticateAdmin(cookieToken);

      // Add user to request
      (request as AdminRequest).user = user;

      return await handler(request as AdminRequest);
    } catch (error) {
      return adminFailure(error);
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
    const ip = request?.headers.get('x-forwarded-for') ||
               request?.headers.get('x-real-ip') ||
               'unknown';

    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId: resourceId ?? null,
        before: (before ?? undefined) as never,
        after: (after ?? undefined) as never,
        ip,
        userAgent,
      },
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
