import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET_RAW = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

if (!JWT_SECRET_RAW) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = JWT_SECRET_RAW;

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
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'] }
  );
}

export function signRefreshToken(payload: Omit<TokenPayload, 'type'>): RefreshToken {
  const token = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
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
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
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
