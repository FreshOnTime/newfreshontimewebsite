type Key = string;

interface Entry {
  count: number;
  expiresAt: number;
}

const store = new Map<Key, Entry>();

export function isRateLimited(key: Key, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const ent = store.get(key);
  if (!ent || ent.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }
  if (ent.count >= limit) return true;
  ent.count += 1;
  store.set(key, ent);
  return false;
}

export function resetKey(key: Key) {
  store.delete(key);
}

export function getRemaining(key: Key, limit: number, windowMs: number) {
  const now = Date.now();
  const ent = store.get(key);
  if (!ent || ent.expiresAt < now) return { remaining: limit, resetAt: now + windowMs };
  return { remaining: Math.max(0, limit - ent.count), resetAt: ent.expiresAt };
}

export function makeKey(prefix: string, id: string) {
  return `${prefix}:${id}`;
}

const rateLimiter = {
  isRateLimited,
  resetKey,
  getRemaining,
  makeKey,
};

export default rateLimiter;
