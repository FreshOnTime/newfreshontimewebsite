import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import sendgrid from '@sendgrid/mail';
/** At-least-once delivery: a provider success followed by a DB failure can resend. */
export async function processEmailOutbox(limit = 2) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) throw new Error('Email provider is not configured');
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  sendgrid.setTimeout(8000);
  const now = new Date();
  const eligibility = { OR: [{ status: 'pending', nextAttemptAt: { lte: now } }, { status: 'processing', leaseUntil: { lt: now } }], attempts: { lt: 6 } };
  const rows = await prisma.emailOutbox.findMany({ where: eligibility, orderBy: { createdAt: 'asc' }, take: Math.min(Math.max(limit,1),2) });
  let sent = 0, failed = 0;
  const deadline = Date.now()+20_000;
  for (const row of rows) {
    if(Date.now()>=deadline) break;
    const claimToken = randomUUID();
    const claim = await prisma.emailOutbox.updateMany({ where: { id: row.id, ...eligibility }, data: { status: 'processing', claimToken, leaseUntil: new Date(Date.now()+5*60_000), attempts: { increment: 1 } } });
    if (!claim.count) continue;
    try {
      if (row.dedupeKey?.startsWith('newsletter-welcome:')) {
        const [,id,version] = row.dedupeKey.split(':');
        const subscriber = await prisma.subscriber.findUnique({ where: { id } });
        if (!subscriber?.isActive || subscriber.unsubscribeVersion !== Number(version)) {
          await prisma.emailOutbox.updateMany({where:{id:row.id,claimToken,status:'processing'},data:{status:'sent',sentAt:new Date(),claimToken:null,leaseUntil:null,html:'',text:null}});
          continue;
        }
      }
      await sendgrid.send({ to: row.recipient, from: process.env.SENDGRID_FROM_EMAIL, subject: row.subject, html: row.html, ...(row.text ? { text: row.text } : {}) });
      await prisma.emailOutbox.updateMany({ where: { id: row.id, claimToken, status: 'processing' }, data: { status: 'sent', sentAt: new Date(), leaseUntil: null, claimToken: null, lastError: null, html: '', text: null } });
      sent++;
    } catch {
      const attempts = row.attempts+1;
      await prisma.emailOutbox.updateMany({ where: { id: row.id, claimToken, status: 'processing' }, data: { status: attempts >= 6 ? 'failed' : 'pending', nextAttemptAt: new Date(Date.now()+Math.min(3600,60*2**attempts)*1000), leaseUntil: null, claimToken: null, lastError: 'Delivery failed; inspect provider activity using the message time.' } });
      failed++;
    }
  }
  // Recover workers that stopped during their final attempt, and remove old PII.
  await prisma.emailOutbox.updateMany({ where: { status: 'processing', attempts: { gte: 6 }, leaseUntil: { lt: now } }, data: { status: 'failed', claimToken: null, leaseUntil: null, lastError: 'Worker lease expired after final attempt.' } });
  await prisma.emailOutbox.deleteMany({ where: { status: { in: ['sent','failed'] }, createdAt: { lt: new Date(Date.now()-30*86400_000) } } });
  return { sent, failed };
}
