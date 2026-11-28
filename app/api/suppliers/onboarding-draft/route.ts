import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { onboardingDraftSchema,isBusinessApplicant } from '@/lib/businessOnboarding';
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function owner(request:NextRequest){
 const auth=await verifyToken(request);
 if(!auth)return null;
 return prisma.user.findUnique({where:{id:auth.userId},select:{id:true,role:true,secondaryRoles:true,isBanned:true,businessOnboardingDraft:true}});
}
export async function GET(request:NextRequest){
 const user=await owner(request);
 if(!user||user.isBanned)return reply({error:'Sign in to continue'},401);
 if(!isBusinessApplicant(user.role,user.secondaryRoles))return reply({error:'Use a regular member account to register a business'},403);
 return reply({draft:user.businessOnboardingDraft});
}
export async function PUT(request:NextRequest){
 const user=await owner(request);
 if(!user||user.isBanned)return reply({error:'Sign in to continue'},401);
 if(!isBusinessApplicant(user.role,user.secondaryRoles))return reply({error:'Use a regular member account to register a business'},403);
 const parsed=onboardingDraftSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return reply({error:'Check your draft details'},400);
 await prisma.user.update({where:{id:user.id},data:{businessOnboardingDraft:JSON.parse(JSON.stringify(parsed.data))}});
 return reply({saved:true});
}
