export type CheckoutRetry = { key: string; intentHash: string; startedAt: string; completed?: boolean };

export function readCheckoutRetry(storage: Pick<Storage, 'getItem'>, scope: string): CheckoutRetry | null {
  try {
    const value = JSON.parse(storage.getItem(scope) || 'null');
    return value && typeof value.key === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(value.key)
      && typeof value.intentHash === 'string' && /^[a-f0-9]{64}$/.test(value.intentHash)
      && Number.isFinite(Date.parse(value.startedAt)) ? value : null;
  } catch { return null; }
}

// Persist only an opaque intent hash, a retry key and a schedule timestamp.
// Addresses and basket contents remain outside browser storage.
export function checkoutRetryForIntent(previous: CheckoutRetry | null, intentHash: string): CheckoutRetry {
  if (previous && !previous.completed && previous.intentHash === intentHash) return previous;
  return { key: crypto.randomUUID(), intentHash, startedAt: new Date().toISOString() };
}

export async function hashCheckoutIntent(intent: unknown): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(intent)));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
