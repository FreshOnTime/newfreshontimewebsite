import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple, AdminRequest } from '@/lib/middleware/adminAuth';
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
    const body = await request.json();

    const slug = String(body.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const contents = (body as { contents?: Array<{ name: string; quantity: string; category: string }> }).contents;
    const b = body as Record<string, unknown>;
    // Whitelist known plan fields; ignore anything else the client sends.
    const scalarKeys = [
      'name', 'description', 'shortDescription', 'price', 'originalPrice', 'frequency',
      'image', 'icon', 'color', 'features', 'isActive', 'isFeatured', 'maxSubscribers',
    ] as const;
    const planData: Record<string, unknown> = {};
    for (const key of scalarKeys) {
      if (b[key] !== undefined) planData[key] = b[key];
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        ...(planData as {
          name: string;
          description: string;
          shortDescription: string;
          price: number;
        }),
        slug,
        contents: Array.isArray(contents) ? { create: contents } : undefined,
      },
      include: { contents: true },
    });

    return NextResponse.json({ success: true, plan: serializePlan(plan) });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
});
