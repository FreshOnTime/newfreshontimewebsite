import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import prisma from '@/lib/prisma';
import {requireAdminSimple,validateOrigin} from '@/lib/middleware/adminAuth';

const query=z.object({page:z.coerce.number().int().min(1).max(100000).default(1),status:z.enum(['pending','approved','rejected']).optional()});
const review=z.object({version:z.string().datetime(),id:z.string().min(1).max(120),decision:z.enum(['pending','approved','rejected']),notes:z.string().trim().min(1).max(2000),confirmed:z.boolean()});
export const GET=requireAdminSimple(async request=>{
 const parsed=query.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!parsed.success)return NextResponse.json({error:'Invalid review filters'},{status:400});
 const {page,status}=parsed.data,where=status?{reviewStatus:status}:{};
 const [records,total]=await prisma.$transaction([prisma.discoveryProspect.findMany({where,orderBy:[{name:'asc'},{id:'asc'}],skip:(page-1)*20,take:20}),prisma.discoveryProspect.count({where})]);
 return NextResponse.json({records,total,page,pages:Math.max(1,Math.ceil(total/20))},{headers:{'Cache-Control':'private, no-store'}});
});
export const PATCH=requireAdminSimple(async (request:NextRequest)=>{
 if(!validateOrigin(request))return NextResponse.json({error:'Invalid request origin'},{status:403});
 const parsed=review.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:'A review decision and notes are required'},{status:400});
 const {id,decision,notes,confirmed,version}=parsed.data;
 if(decision==='approved'&&!confirmed)return NextResponse.json({error:'Confirm identity, current business facts and permission to publish first'},{status:400});
 const existing=await prisma.discoveryProspect.findUnique({where:{id},select:{id:true}});
 if(!existing)return NextResponse.json({error:'Prospect not found'},{status:404});
 const result=await prisma.discoveryProspect.updateMany({where:{id,updatedAt:new Date(version)},data:{reviewStatus:decision,permissionStatus:decision==='approved'?'cleared':decision==='rejected'?'denied':'not_assessed',reviewNotes:notes,reviewedAt:new Date()}});
 if(result.count!==1)return NextResponse.json({error:'Listing changed. Refresh before reviewing again.'},{status:409});
 const record=await prisma.discoveryProspect.findUniqueOrThrow({where:{id}});
 return NextResponse.json({record},{headers:{'Cache-Control':'private, no-store'}});
});
