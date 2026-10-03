import { BasketLifecycleError } from '@/lib/basketOrderLifecycle';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { SubscriptionDeliveryService, DeliveryTransitionError } from '@/lib/services/subscriptionDeliveryService';
const input = z.object({ action: z.enum(['confirm', 'deliver', 'cancel']), version: z.number().int().min(0) });
export const PATCH = requireAdmin(async (request, { params }) => {
  try {
    const { id } = await params;
    const { action, version } = input.parse(await request.json());
    const delivery = await SubscriptionDeliveryService.transitionDelivery(id, action, version);
    return NextResponse.json({ success: true, delivery: { ...delivery, _id: delivery.id, price: Number(delivery.price) } }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json({ error: (error instanceof DeliveryTransitionError || error instanceof BasketLifecycleError) ? error.message : 'Invalid delivery update' }, { status: (error instanceof DeliveryTransitionError || error instanceof BasketLifecycleError) ? error.status : error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500 });
  }
});
