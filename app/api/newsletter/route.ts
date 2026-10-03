import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendEmail, frontendUrl } from '@/lib/services/mailService';
import { unsubscribeToken } from '@/lib/newsletterTokens';
import { isRateLimited, makeKey } from '@/lib/middleware/rateLimiter';
const schema = z.object({ email: z.string().trim().toLowerCase().max(254).email(), source: z.enum(['homepage','checkout','popup','footer']).catch('homepage') });
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(makeKey('newsletter',ip),10,600_000)) return NextResponse.json({ ok:false,error:'Please try again later.' },{status:429,headers:{'Retry-After':'600'}});
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ok:false,error:'Please enter a valid email address'},{status:400});
  try {
    const { email, source } = parsed.data;
    const origin = frontendUrl();
    await prisma.$transaction(async tx => {
      // PostgreSQL serializes conflicts on email. Active duplicates never enqueue another welcome.
      const rows = await tx.$queryRaw<{id:string; unsubscribeVersion:number}[]>`
        INSERT INTO "subscribers" ("id","email","source","subscribedAt","isActive","unsubscribeVersion")
        VALUES (${randomUUID()},${email},${source}::"SubscriberSource",NOW(),true,0)
        ON CONFLICT ("email") DO UPDATE SET "isActive"=true,"subscribedAt"=NOW(),"unsubscribedAt"=NULL,
          "unsubscribeVersion"="subscribers"."unsubscribeVersion"+1,"source"=EXCLUDED."source"
        WHERE "subscribers"."isActive"=false RETURNING "id","unsubscribeVersion"`;
      if (!rows.length) return;
      const row = rows[0], link = `${origin}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken(row.id,row.unsubscribeVersion))}`;
      await sendEmail(email,'Welcome to FreshPick',`<h1>Welcome to FreshPick</h1><p>Food stories, seasonal news and market updates.</p><p><a href="${origin}/products">Explore the market</a></p><p><a href="${link}">Unsubscribe</a></p>`,`Welcome to FreshPick. Unsubscribe: ${link}`,{tx,dedupeKey:`newsletter-welcome:${row.id}:${row.unsubscribeVersion}`});
    });
    return NextResponse.json({ok:true,message:'Your newsletter subscription is saved.'},{headers:{'Cache-Control':'no-store'}});
  } catch {
    console.error('Newsletter subscription could not be saved');
    return NextResponse.json({ok:false,error:'Failed to subscribe. Please try again.'},{status:500});
  }
}
