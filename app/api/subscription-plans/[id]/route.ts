import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, AdminRequest } from "@/lib/middleware/adminAuth";
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
    const body = (await request.json()) as Record<string, unknown>;

    // Only allow known scalar fields; `contents` is managed separately.
    const allowed = [
      'name', 'slug', 'description', 'shortDescription', 'price', 'originalPrice',
      'frequency', 'image', 'icon', 'color', 'features', 'isActive', 'isFeatured',
      'maxSubscribers',
    ] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    const exists = await prisma.subscriptionPlan.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return NextResponse.json(
        { success: false, message: "Subscription plan not found" },
        { status: 404 }
      );
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data,
      include: { contents: true },
    });

    return NextResponse.json({ success: true, plan: serializePlan(plan) });
  } catch (error) {
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

    await prisma.subscriptionPlan.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subscription plan" },
      { status: 500 }
    );
  }
});
