import { apiFetch } from './client';

/** Refresh an expired session once; callers handle the final response. */
export async function authenticatedApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await apiFetch(path, init);
  if (response.status !== 401 || init.signal?.aborted) return response;

  const refresh = await apiFetch('/api/auth/refresh', { method: 'POST', signal: init.signal });
  if (!refresh.ok) return response;
  return apiFetch(path, init);
}
