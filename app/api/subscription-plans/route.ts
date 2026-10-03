import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple, AdminRequest } from '@/lib/middleware/adminAuth';
import { createPlanSchema } from '@/lib/subscriptionPlanSchema';
import { PlanWriteError,validatePlanInventory } from '@/lib/subscriptionPlanValidation';
import { z } from 'zod';
import { serializePlan } from '@/lib/subscriptionUtils';

// GET all active subscription plans
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      include: { contents: true },
    });

    return NextResponse.json({
      success: true,
      plans: plans.map(serializePlan),
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

// POST create a new subscription plan (admin only)
export const POST = requireAdminSimple(async (request: AdminRequest) => {
  try {
    const { contents, ...data } = createPlanSchema.parse(await request.json());
    const slug=data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    if(!slug)throw new PlanWriteError('Choose a plan name that can form a URL.');
    const plan=await prisma.$transaction(async tx=>{
      await validatePlanInventory(tx,data.inventoryManaged,contents);
      return tx.subscriptionPlan.create({data:{...data,image:data.image||'/images/subscription-default.jpg',slug,contents:{create:contents}},include:{contents:true}});
    });

    return NextResponse.json({ success: true, plan: serializePlan(plan) });
  } catch (error) {
    if(error instanceof z.ZodError||error instanceof SyntaxError)return NextResponse.json({success:false,message:error instanceof z.ZodError?error.issues[0].message:'Invalid request'},{status:400});
    if(error instanceof PlanWriteError)return NextResponse.json({success:false,message:error.message},{status:error.status});
    if(error&&typeof error==='object'&&'code' in error&&error.code==='P2002')return NextResponse.json({success:false,message:'A plan with this name already exists'},{status:409});
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
});
