jest.mock('next/server', () => jest.requireActual('next/server'));
import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/route';
import prisma from '@/lib/prisma';
import { isRateLimited } from '@/lib/middleware/rateLimiter';

jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { contactEnquiry: { create: jest.fn(), findUnique: jest.fn() } } }));
jest.mock('@/lib/middleware/rateLimiter', () => ({ isRateLimited: jest.fn(() => false), makeKey: (prefix: string, ip: string) => `${prefix}:${ip}` }));
const body = { submissionId: '6d9480ea-249a-40f3-a273-96e4ab5caaf8', name: ' Grower ', email: 'GROWER@example.com', message: ' Can I sell herbs? ', subject: ' Herbs ', type: 'question', source: 'producers', priority: 'normal', orderId: '' };
const saved = { id: '19d43c24-04f9-4789-8f47-75819b72b162', ...body, name: 'Grower', email: 'grower@example.com', message: 'Can I sell herbs?', subject: 'Herbs', status: 'new', internalNotes: 'Private admin note' };
const request = (data: unknown = body) => ({ headers: new Headers(), json: async () => data }) as NextRequest;
beforeEach(() => { jest.clearAllMocks(); (isRateLimited as jest.Mock).mockReturnValue(false); (prisma.contactEnquiry.create as jest.Mock).mockResolvedValue(saved); (prisma.contactEnquiry.findUnique as jest.Mock).mockResolvedValue(saved); });
it('persists a producer question with normalized values and server-controlled status', async () => {
  const response = await POST(request({ ...body, status: 'resolved', internalNotes: 'untrusted note' }));
  expect(response.status).toBe(201);
  expect(prisma.contactEnquiry.create).toHaveBeenCalledWith({ data: expect.objectContaining({ submissionId: body.submissionId, name: 'Grower', email: 'grower@example.com', message: 'Can I sell herbs?', source: 'producers' }), select: { id: true } });
  const data = (prisma.contactEnquiry.create as jest.Mock).mock.calls[0][0].data;
  expect(data).not.toHaveProperty('status'); expect(data).not.toHaveProperty('internalNotes');
  expect(await response.json()).toEqual({ ok: true, enquiryId: saved.id });
});
it.each([{ name: '' }, { email: 'bad' }, { message: ' ' }, { message: 'x'.repeat(5001) }, { type: 'invalid' }, { source: 'admin' }, { priority: 'urgent' }, { submissionId: 'not-a-uuid' }])('rejects invalid fields before persistence: %s', async change => {
  expect((await POST(request({ ...body, ...change }))).status).toBe(400); expect(prisma.contactEnquiry.create).not.toHaveBeenCalled();
});
it('supports existing clients without a retry identifier', async () => {
  const { submissionId, ...legacy } = body; void submissionId;
  expect((await POST(request(legacy))).status).toBe(201);
  expect((prisma.contactEnquiry.create as jest.Mock).mock.calls[0][0].data.submissionId).toMatch(/^[\da-f-]{36}$/);
});
it('never reports success when the database save fails', async () => {
  (prisma.contactEnquiry.create as jest.Mock).mockRejectedValue(new Error('database unavailable'));
  const log = jest.spyOn(console,'error').mockImplementation(() => {});
  const response = await POST(request()); expect(response.status).toBe(500); expect(await response.json()).toMatchObject({ ok: false });
  expect(JSON.stringify(log.mock.calls)).not.toContain(body.email); log.mockRestore();
});
it('reuses an already-saved identical submission after a lost response', async () => {
  (prisma.contactEnquiry.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
  const response = await POST(request()); expect(response.status).toBe(200); expect(await response.json()).toEqual({ ok: true, enquiryId: saved.id });
});
it('rejects a retry identifier reused with a different question', async () => {
  (prisma.contactEnquiry.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
  expect((await POST(request({ ...body, message: 'Changed question' }))).status).toBe(409);
});
it('returns 400 for malformed JSON', async () => {
  expect((await POST({ headers: new Headers(), json: async () => { throw new SyntaxError('bad'); } } as unknown as NextRequest)).status).toBe(400);
});
it('limits repeated public submissions before any write', async () => {
  (isRateLimited as jest.Mock).mockReturnValue(true);
  const response = await POST(request()); expect(response.status).toBe(429); expect(response.headers.get('Retry-After')).toBe('600'); expect(prisma.contactEnquiry.create).not.toHaveBeenCalled();
});
