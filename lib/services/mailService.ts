import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export function frontendUrl() {
  const raw = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) throw new Error('FRONTEND_URL must be an HTTPS site URL');
  return url.origin;
}
/** Persist before the request ends; the scheduled worker sends and retries. */
export async function sendEmail(to: string, subject: string, html: string, text?: string, options?: { tx?: Prisma.TransactionClient; dedupeKey?: string }) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 254) throw new Error('Invalid email recipient');
  const db = options?.tx || prisma;
  const data = { recipient: to, subject: subject.slice(0,200), html, text, dedupeKey: options?.dedupeKey };
  if (options?.dedupeKey) return db.emailOutbox.upsert({ where: { dedupeKey: options.dedupeKey }, create: data, update: {} });
  return db.emailOutbox.create({ data });
}
export async function sendVerificationEmail(email: string, token: string) {
  const link = `${frontendUrl()}/auth/verify?token=${encodeURIComponent(token)}`;
  return sendEmail(email, 'Verify your account', `<p>Please verify your email by clicking <a href="${link}">this link</a>.</p>`, `Verify your account: ${link}`);
}
export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${frontendUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail(email, 'Reset your password', `<p>Reset your password <a href="${link}">here</a>. If you did not request this, ignore this email.</p>`, `Reset your password: ${link}`);
}
export async function sendOrderEmail(to: string, order: { _id?: string; total?: number }, tx?: Prisma.TransactionClient) {
  return sendEmail(to, `Order Confirmation #${order._id}`, `<p>Thank you for order #${order._id}.</p><p>Total: ${order.total}</p>`, `Order #${order._id} placed.`, { tx, dedupeKey: `order-confirmation:${order._id}` });
}
