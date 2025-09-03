import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

// Create rate limiters for different endpoints
const authLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: 50, // Number of attempts (increased for development)
  duration: 300, // Per 5 minutes (reduced from 15 minutes)
  blockDuration: 300, // Block for 5 minutes (reduced)
});

const generalLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100, // Number of requests
  duration: 60, // Per 1 minute
  blockDuration: 60, // Block for 1 minute
});

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1'; // Fallback for development
}

export async function rateLimit(
  req: NextRequest,
  type: 'auth' | 'general' = 'general'
): Promise<NextResponse | null> {
  try {
    const limiter = type === 'auth' ? authLimiter : generalLimiter;
    const clientIP = getClientIP(req);
    
    await limiter.consume(clientIP);
    return null; // No rate limit exceeded
  } catch (rateLimiterRes: unknown) {
    const limiter = type === 'auth' ? authLimiter : generalLimiter;
    const error = rateLimiterRes as { remainingPoints?: number; msBeforeNext?: number };
    const remainingPoints = error.remainingPoints || 0;
    const msBeforeNext = error.msBeforeNext || 0;
    
    return NextResponse.json(
      { 
        error: 'Too many requests',
        retryAfter: Math.round(msBeforeNext / 1000),
        remainingPoints 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.round(msBeforeNext / 1000).toString(),
          'X-RateLimit-Limit': limiter.points.toString(),
          'X-RateLimit-Remaining': Math.max(0, remainingPoints).toString(),
          'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
        }
      }
    );
  }
}

export function withRateLimit(
  handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  type: 'auth' | 'general' = 'general'
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const rateLimitResponse = await rateLimit(req, type);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(req, ...args);
  };
}
