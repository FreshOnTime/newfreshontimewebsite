import { createHmac, timingSafeEqual } from 'crypto';
function signature(payload: string) {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('Newsletter signing secret is not configured');
  return createHmac('sha256', secret).update(`newsletter-unsubscribe:${payload}`).digest('base64url');
}
export function unsubscribeToken(id: string, version: number) {
  const payload = Buffer.from(JSON.stringify({ id, version })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}
export function readUnsubscribeToken(token: string): { id: string; version: number } | null {
  if (token.length > 1024) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = Buffer.from(signature(parts[0])), actual = Buffer.from(parts[1]);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const value = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return typeof value.id === 'string' && value.id.length <= 100 && Number.isSafeInteger(value.version) && value.version >= 0 ? value : null;
  } catch { return null; }
}
