import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { serializePlan } from '@/lib/subscriptionUtils';
export const GET=requireAdminSimple(async()=>{
  try{const plans=await prisma.subscriptionPlan.findMany({include:{contents:{include:{product:{select:{id:true,name:true,sku:true}}}}},orderBy:{price:'asc'}});return NextResponse.json({success:true,plans:plans.map(serializePlan)},{headers:{'Cache-Control':'private, no-store'}});}catch{return NextResponse.json({success:false,message:'Unable to load subscription plans'},{status:500});}
});
