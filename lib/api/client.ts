const PUBLIC_API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

function resolveUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return PUBLIC_API_BASE ? `${PUBLIC_API_BASE}${normalized}` : normalized;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(resolveUrl(path), {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });
}

export const apiUrl = resolveUrl;
