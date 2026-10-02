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
