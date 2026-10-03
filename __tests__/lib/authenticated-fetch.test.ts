import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { apiFetch } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({ apiFetch: jest.fn() }));
const request = apiFetch as jest.MockedFunction<typeof apiFetch>;
const response = (status: number) => ({ status, ok: status >= 200 && status < 300 }) as Response;

beforeEach(() => request.mockReset());

test('successful requests do not refresh the session', async () => {
  const result = response(200);
  request.mockResolvedValueOnce(result);
  expect(await authenticatedApiFetch('/api/orders')).toBe(result);
  expect(request).toHaveBeenCalledTimes(1);
});

test('replays the same update once after a successful refresh', async () => {
  const result = response(200);
  const init = { method: 'PATCH', body: JSON.stringify({ action: 'pause' }) };
  request.mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(200)).mockResolvedValueOnce(result);
  expect(await authenticatedApiFetch('/api/orders/recurring/123', init)).toBe(result);
  expect(request.mock.calls).toEqual([
    ['/api/orders/recurring/123', init],
    ['/api/auth/refresh', { method: 'POST', signal: undefined }],
    ['/api/orders/recurring/123', init],
  ]);
});

test('a second unauthorized response never starts another refresh', async () => {
  request.mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(200)).mockResolvedValueOnce(response(401));
  expect((await authenticatedApiFetch('/api/orders')).status).toBe(401);
  expect(request).toHaveBeenCalledTimes(3);
});

test('failed refresh returns the original unauthorized response', async () => {
  const unauthorized = response(401);
  request.mockResolvedValueOnce(unauthorized).mockResolvedValueOnce(response(401));
  expect(await authenticatedApiFetch('/api/orders')).toBe(unauthorized);
  expect(request).toHaveBeenCalledTimes(2);
});

test('an aborted request does not refresh the session', async () => {
  const controller = new AbortController();
  controller.abort();
  request.mockResolvedValueOnce(response(401));
  await authenticatedApiFetch('/api/orders', { signal: controller.signal });
  expect(request).toHaveBeenCalledTimes(1);
});

test('simultaneous expired admin requests share a single token rotation', async () => {
  let finishRefresh!: (value: Response) => void;
  let refreshStarted = false;
  request.mockImplementation(async path => {
    if (path === '/api/auth/refresh') {
      refreshStarted = true;
      return new Promise<Response>(resolve => { finishRefresh = resolve; });
    }
    return response(refreshStarted ? 200 : 401);
  });
  const results = Promise.all([
    authenticatedApiFetch('/api/admin/enquiries'),
    authenticatedApiFetch('/api/admin/business-leads'),
  ]);
  await new Promise(resolve => setTimeout(resolve, 0));
  finishRefresh(response(200));
  expect((await results).map(result => result.status)).toEqual([200, 200]);
  expect(request.mock.calls.filter(([path]) => path === '/api/auth/refresh')).toHaveLength(1);
});

test('cancelling one caller during shared refresh does not replay it or cancel another caller', async () => {
  const controller = new AbortController();
  let finishRefresh!: (value: Response) => void;
  request.mockImplementation(async path => path === '/api/auth/refresh'
    ? new Promise<Response>(resolve => { finishRefresh = resolve; })
    : response(request.mock.calls.length <= 2 ? 401 : 200));
  const results = Promise.all([
    authenticatedApiFetch('/api/admin/enquiries', { signal: controller.signal }),
    authenticatedApiFetch('/api/admin/suppliers'),
  ]);
  await new Promise(resolve => setTimeout(resolve, 0));
  controller.abort();
  finishRefresh(response(200));
  expect((await results).map(result => result.status)).toEqual([401, 200]);
  expect(request.mock.calls.filter(([path]) => path === '/api/admin/enquiries')).toHaveLength(1);
  expect(request.mock.calls.filter(([path]) => path === '/api/auth/refresh')).toHaveLength(1);
});

test('role denial is never retried as a session expiry', async () => {
  request.mockResolvedValueOnce(response(403));
  expect((await authenticatedApiFetch('/api/admin/suppliers')).status).toBe(403);
  expect(request).toHaveBeenCalledTimes(1);
});
