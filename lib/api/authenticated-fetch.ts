import { apiFetch } from './client';

let refreshInFlight: Promise<Response> | null = null;

/** Share token rotation so simultaneous admin requests cannot invalidate each other's refresh token. */
export function refreshSession(): Promise<Response> {
  if (!refreshInFlight) {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),10000);
    refreshInFlight = apiFetch('/api/auth/refresh', { method: 'POST', signal: controller.signal })
      .finally(() => { clearTimeout(timer);refreshInFlight = null; });
  }
  return refreshInFlight;
}

/** Refresh an expired session once; callers handle the final response. */
export async function authenticatedApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await apiFetch(path, init);
  if (response.status !== 401 || init.signal?.aborted) return response;

  const refresh = await refreshSession();
  if (!refresh.ok || init.signal?.aborted) return response;
  return apiFetch(path, init);
}
