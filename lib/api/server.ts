import { getBaseUrl } from '@/lib/serverUrl';

export async function serverApiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${getBaseUrl()}${normalized}`, {
    ...init,
    headers,
  });
}
