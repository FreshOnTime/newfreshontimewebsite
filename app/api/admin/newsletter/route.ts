import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
const headers = {'Cache-Control':'private, no-store'};
export const GET = requireAdminSimple(async request => {
  const query=z.object({page:z.coerce.number().int().min(1).max(100000).default(1),status:z.enum(['active','inactive']).optional(),search:z.string().trim().max(100).default('')}).safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if(!query.success)return NextResponse.json({error:'Invalid filters'},{status:400,headers});
  try{const {page,status,search}=query.data,where={...(status?{isActive:status==='active'}:{}),...(search?{email:{contains:search,mode:'insensitive' as const}}:{})};const [subscribers,total]=await prisma.$transaction([prisma.subscriber.findMany({where,skip:(page-1)*20,take:20,orderBy:[{subscribedAt:'desc'},{id:'asc'}],select:{id:true,email:true,isActive:true,source:true,subscribedAt:true,unsubscribeVersion:true}}),prisma.subscriber.count({where})]);return NextResponse.json({subscribers,total,pages:Math.max(1,Math.ceil(total/20))},{headers});}catch{return NextResponse.json({error:'Unable to load subscribers'},{status:500,headers});}
});
export const PATCH = requireAdminSimple(async request => {
  const body=z.object({id:z.string().min(1).max(100),version:z.number().int().nonnegative()}).safeParse(await request.json().catch(()=>null));
  if(!body.success)return NextResponse.json({error:'Invalid request'},{status:400,headers});
  try{const result=await prisma.subscriber.updateMany({where:{id:body.data.id,unsubscribeVersion:body.data.version,isActive:true},data:{isActive:false,unsubscribedAt:new Date()}});if(!result.count)return NextResponse.json({error:'Subscription changed. Refresh and try again.'},{status:409,headers});return NextResponse.json({ok:true},{headers});}catch{return NextResponse.json({error:'Unable to update subscriber'},{status:500,headers});}
});
