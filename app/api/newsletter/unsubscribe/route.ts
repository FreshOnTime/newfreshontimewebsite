import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { readUnsubscribeToken } from '@/lib/newsletterTokens';
export async function POST(request: Request) {
  const body = z.object({token:z.string().min(1).max(1024)}).safeParse(await request.json().catch(()=>null));
  if (!body.success) return NextResponse.json({error:'Invalid unsubscribe link'},{status:400});
  try {
    const claim = readUnsubscribeToken(body.data.token);
    if (!claim) return NextResponse.json({error:'Invalid unsubscribe link'},{status:400});
    const result = await prisma.subscriber.updateMany({where:{id:claim.id,unsubscribeVersion:claim.version},data:{isActive:false,unsubscribedAt:new Date()}});
    if (!result.count) return NextResponse.json({error:'This link is no longer current. Use the link in your latest newsletter.'},{status:410});
    return NextResponse.json({ok:true,message:'You have been unsubscribed.'},{headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'Unable to unsubscribe. Please try again.'},{status:503}); }
}
