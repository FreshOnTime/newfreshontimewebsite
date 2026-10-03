import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';

export class MessageWriteError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}

/** Deterministic per-recipient IDs keep network retries from duplicating a send. */
function messageId(submissionId: string, recipientId: string) {
  const hash = createHash('sha256').update(`${submissionId}:${recipientId}`).digest('hex').slice(0, 32);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20)}`;
}

export async function saveAccountMessages(tx: Prisma.TransactionClient, input: {
  submissionId: string; senderId: string; recipientIds: string[]; subject: string; content: string;
}) {
  const rows = input.recipientIds.map(recipientId => ({ id: messageId(input.submissionId, recipientId), senderId: input.senderId, recipientId, subject: input.subject, content: input.content })).sort((a, b) => a.id.localeCompare(b.id));
  // ON CONFLICT waits for concurrent senders. Compare the persisted content
  // afterwards; a reused key must not silently accept a different message.
  const created = await tx.message.createMany({ data: rows, skipDuplicates: true });
  const saved = await tx.message.findMany({ where: { id: { in: rows.map(row => row.id) } } });
  if (saved.length !== rows.length || saved.some(message => {
    const expected = rows.find(row => row.id === message.id);
    return !expected || message.senderId !== expected.senderId || message.recipientId !== expected.recipientId || message.subject !== expected.subject || message.content !== expected.content;
  })) throw new MessageWriteError('This send identifier belongs to a different message. Start a new message.');
  return { messages: saved, replay: created.count === 0 };
}
