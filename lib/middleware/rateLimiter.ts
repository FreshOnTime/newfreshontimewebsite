import { NextRequest } from 'next/server';
import { TooManyRequestsError } from '../utils/errors';

// Simple in-memory rate limiter for development
// In production, use Redis or Upstash for rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (windowMs: number, maxRequests: number) => {
  return (req: NextRequest): void => {
    const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < windowStart) {
        delete store[key];
      }
    });

    if (!store[identifier]) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return;
    }

    if (store[identifier].resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return;
    }

    store[identifier].count++;

    if (store[identifier].count > maxRequests) {
      throw new TooManyRequestsError('Too many requests, please try again later.');
    }
  };
};

// For production use with Upstash Redis
export const upstashRateLimiter = async (
  identifier: string,
  windowMs: number,
  maxRequests: number
): Promise<boolean> => {
  // Implementation would use Upstash Redis REST API
  // This is a placeholder for the production implementation
  console.log(`Rate limiting ${identifier}: ${maxRequests} requests per ${windowMs}ms`);
  return true;
};
