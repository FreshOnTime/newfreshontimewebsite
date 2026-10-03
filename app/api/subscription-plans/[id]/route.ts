import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, AdminRequest } from "@/lib/middleware/adminAuth";
import { updatePlanSchema } from '@/lib/subscriptionPlanSchema';
import { PlanWriteError,validatePlanInventory } from '@/lib/subscriptionPlanValidation';
import { z } from 'zod';
import { serializePlan } from "@/lib/subscriptionUtils";

// GET single subscription plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { contents: true },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Subscription plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, plan: serializePlan(plan) });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription plan" },
      { status: 500 }
    );
  }
}

// PUT update subscription plan (admin only)
export const PUT = requireAdmin(async (
  request: AdminRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const {version,contents,...data}=updatePlanSchema.parse(await request.json());
    const plan=await prisma.$transaction(async tx=>{
      const existing=await tx.subscriptionPlan.findUnique({where:{id},include:{contents:true}});
      if(!existing)throw new PlanWriteError('Subscription plan not found',404);
      if(data.maxSubscribers!=null&&data.maxSubscribers<existing.currentSubscribers)throw new PlanWriteError('Capacity cannot be lower than the current subscriber count.');
      const nextContents=contents??existing.contents;
      await validatePlanInventory(tx,data.inventoryManaged??existing.inventoryManaged,nextContents);
      const changed=await tx.subscriptionPlan.updateMany({where:{id,updatedAt:new Date(version)},data:{...data,updatedAt:new Date(),...(data.image!==undefined?{image:data.image||'/images/subscription-default.jpg'}:{})}});
      if(changed.count!==1)throw new PlanWriteError('This plan changed. Refresh it before saving.',409);
      if(contents){await tx.planContent.deleteMany({where:{planId:id}});if(contents.length)await tx.planContent.createMany({data:contents.map(item=>({...item,planId:id}))});}
      return tx.subscriptionPlan.findUniqueOrThrow({where:{id},include:{contents:true}});
    });

    return NextResponse.json({ success: true, plan: serializePlan(plan) });
  } catch (error) {
    if(error instanceof z.ZodError||error instanceof SyntaxError)return NextResponse.json({success:false,message:error instanceof z.ZodError?error.issues[0].message:'Invalid request'},{status:400});
    if(error instanceof PlanWriteError)return NextResponse.json({success:false,message:error.message},{status:error.status});
    console.error("Error updating subscription plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subscription plan" },
      { status: 500 }
    );
  }
});

// DELETE subscription plan (admin only)
export const DELETE = requireAdmin(async (
  request: AdminRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;

    const exists = await prisma.subscriptionPlan.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return NextResponse.json(
        { success: false, message: "Subscription plan not found" },
        { status: 404 }
      );
    }

    if(await prisma.subscription.count({where:{planId:id}}))return NextResponse.json({success:false,message:'This plan has subscription history. Make it inactive instead of deleting it.'},{status:409});
    await prisma.subscriptionPlan.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    if(error&&typeof error==='object'&&'code' in error&&error.code==='P2003')return NextResponse.json({success:false,message:'This plan is in use. Make it inactive instead.'},{status:409});
    console.error("Error deleting subscription plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subscription plan" },
      { status: 500 }
    );
  }
});
