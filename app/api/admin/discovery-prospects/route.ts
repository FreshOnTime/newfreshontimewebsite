import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import prisma from '@/lib/prisma';
import {requireAdminSimple,validateOrigin} from '@/lib/middleware/adminAuth';

const review=z.object({id:z.string().min(1).max(120),decision:z.enum(['pending','approved','rejected']),notes:z.string().trim().min(1).max(2000),confirmed:z.boolean()});
export const GET=requireAdminSimple(async ()=>{
 const records=await prisma.discoveryProspect.findMany({orderBy:[{name:'asc'},{id:'asc'}],take:500});
 return NextResponse.json({records},{headers:{'Cache-Control':'private, no-store'}});
});
export const PATCH=requireAdminSimple(async (request:NextRequest)=>{
 if(!validateOrigin(request))return NextResponse.json({error:'Invalid request origin'},{status:403});
 const parsed=review.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:'A review decision and notes are required'},{status:400});
 const {id,decision,notes,confirmed}=parsed.data;
 if(decision==='approved'&&!confirmed)return NextResponse.json({error:'Confirm identity, current business facts and permission to publish first'},{status:400});
 const existing=await prisma.discoveryProspect.findUnique({where:{id},select:{id:true}});
 if(!existing)return NextResponse.json({error:'Prospect not found'},{status:404});
 const record=await prisma.discoveryProspect.update({where:{id},data:{reviewStatus:decision,permissionStatus:decision==='approved'?'cleared':decision==='rejected'?'denied':'not_assessed',reviewNotes:notes,reviewedAt:new Date()}});
 return NextResponse.json({record},{headers:{'Cache-Control':'private, no-store'}});
});
