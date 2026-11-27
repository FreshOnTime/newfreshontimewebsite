import {requireAuth} from '@/lib/auth';
import prisma from '@/lib/prisma';
export const dynamic='force-dynamic';
export const GET=requireAuth(async request=>{
 const user=await prisma.user.findUnique({where:{id:request.user!.userId},select:{role:true,isBanned:true,supplier:{select:{name:true,status:true,applicationStatus:true,makerPublished:true,makerHandle:true}}}});
 if(!user||user.isBanned)return Response.json({error:'Sign in again.'},{status:401});
 if(user.role!=='supplier')return Response.json({error:'Business account required.'},{status:403});
 const s=user.supplier;
 const state=!s?'not_submitted':s.applicationStatus==='pending'?'pending':s.applicationStatus==='rejected'?'rejected':s.applicationStatus==='approved'&&s.status==='active'?'approved':'inactive';
 return Response.json({state,name:s?.name??null,published:state==='approved'&&!!s?.makerPublished&&!!s.makerHandle},{headers:{'Cache-Control':'private, no-store'}});
});
