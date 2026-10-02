const LOCAL_ORIGIN = 'https://freshpick.invalid';

/** Return a browser-safe local destination, including its query and fragment. */
export function safeAccountRedirect(requested: string | null | undefined): string | null {
  if (!requested?.startsWith('/') || /[\\\u0000-\u001f\u007f]/.test(requested)) return null;
  try {
    const decoded = decodeURIComponent(requested);
    if (decoded.startsWith('//') || decoded.includes('\\')) return null;
    const url = new URL(requested, LOCAL_ORIGIN);
    if (url.origin !== LOCAL_ORIGIN || url.pathname === '/auth' || url.pathname.startsWith('/auth/')) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function accountDestination(role: string, requested?: string | null): string {
  return role === 'admin' ? '/admin' : safeAccountRedirect(requested) || '/dashboard';
}

export function accountLink(path: string, requested?: string | null): string {
  const destination = safeAccountRedirect(requested);
  return destination ? `${path}?redirect=${encodeURIComponent(destination)}` : path;
}
