import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin, type AdminRequest } from '@/lib/middleware/adminAuth';
import { SubscriptionDeliveryService } from '@/lib/services/subscriptionDeliveryService';

const updateSchema = z.object({
  action: z.enum(['confirm', 'deliver', 'cancel']),
});

export const PATCH = requireAdmin(async (request: AdminRequest, { params }) => {
  try {
    const { id } = await params;
    const { action } = updateSchema.parse(await request.json());

    if (action === 'deliver') {
      const delivery = await SubscriptionDeliveryService.markDelivered(id);
      return NextResponse.json({ success: true, delivery: { ...delivery, _id: delivery.id, price: Number(delivery.price) } });
    }

    const existing = await prisma.subscriptionDelivery.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Subscription delivery not found' }, { status: 404 });
    if (existing.status === 'delivered') return NextResponse.json({ error: 'Delivered subscriptions cannot be changed' }, { status: 400 });

    const status = action === 'confirm' ? 'confirmed' : 'cancelled';
    const delivery = await prisma.subscriptionDelivery.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, delivery: { ...delivery, _id: delivery.id, price: Number(delivery.price) } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    const message = error instanceof Error ? error.message : 'Failed to update subscription delivery';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
