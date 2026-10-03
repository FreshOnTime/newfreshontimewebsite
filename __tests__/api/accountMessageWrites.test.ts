import { saveAccountMessages, MessageWriteError } from '@/lib/accountMessages';
import type { Prisma } from '@prisma/client';

function fixture() {
  const rows = new Map<string, any>();
  const tx = { message: {
    createMany: jest.fn(async ({ data }: any) => {
      let count = 0;
      for (const row of data) if (!rows.has(row.id)) { rows.set(row.id, { ...row }); count++; }
      return { count };
    }),
    findMany: jest.fn(async ({ where }: any) => where.id.in.map((id: string) => rows.get(id)).filter(Boolean)),
  } };
  return { tx: tx as unknown as Prisma.TransactionClient, rows };
}
const input = { submissionId: '3cc31836-ae23-4a49-8022-c270ec057b58', senderId: 'admin', recipientIds: ['customer', 'producer'], subject: 'Delivery update', content: 'Your delivery is ready.' };
it('persists one message per linked account and safely replays a network retry', async () => {
  const { tx, rows } = fixture();
  expect((await saveAccountMessages(tx, input)).replay).toBe(false);
  expect((await saveAccountMessages(tx, { ...input, recipientIds: [...input.recipientIds].reverse() })).replay).toBe(true);
  expect(rows.size).toBe(2);
  expect(new Set([...rows.values()].map(row => row.recipientId))).toEqual(new Set(input.recipientIds));
});
it.each([{ subject: 'Different subject' }, { content: 'Different content' }, { senderId: 'different-admin' }])('rejects a send key reused for a different intent', async change => {
  const { tx } = fixture();
  await saveAccountMessages(tx, input);
  await expect(saveAccountMessages(tx, { ...input, ...change })).rejects.toBeInstanceOf(MessageWriteError);
});
it('keeps unrelated submission identifiers separate', async () => {
  const { tx, rows } = fixture();
  await saveAccountMessages(tx, input);
  await saveAccountMessages(tx, { ...input, submissionId: 'c0a99fea-362f-4ab7-9ec9-85622e861010' });
  expect(rows.size).toBe(4);
});
