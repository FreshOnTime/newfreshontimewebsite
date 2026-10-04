import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '7d';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

// Next.js imports route modules during builds. Resolve secrets only when an
// authentication operation runs, and never substitute a build/default key.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email?: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface RefreshToken {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

export function signAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    getJwtSecret(),
    { expiresIn: JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'] }
  );
}

export function signRefreshToken(payload: Omit<TokenPayload, 'type'>): RefreshToken {
  const token = jwt.sign(
    { ...payload, type: 'refresh' },
    getJwtSecret(),
    { expiresIn: JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'] }
  );

  // Hash the token for storage in database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  return {
    token,
    hashedToken,
    expiresAt
  };
}

export function verifyToken(token: string): TokenPayload {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
