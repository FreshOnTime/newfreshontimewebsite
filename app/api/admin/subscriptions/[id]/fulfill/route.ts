import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { SubscriptionDeliveryService, BasketFulfillmentError } from '@/lib/services/subscriptionDeliveryService';
import { DeliveryPolicyError } from '@/lib/deliveryPolicy';
export const POST = requireAdmin(async (_request, { params }) => {
  try {
    const { id } = await params;
    const delivery = await SubscriptionDeliveryService.createPendingDelivery(id);
    if (!delivery) return NextResponse.json({ error: 'This basket is not due or was already queued. Refresh the queue.' }, { status: 409 });
    return NextResponse.json({ success: true, delivery: { ...delivery, price: Number(delivery.price) } }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof BasketFulfillmentError || error instanceof DeliveryPolicyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Basket retry failed:', error);
    return NextResponse.json({ error: 'Unable to fulfill basket. Try again later.' }, { status: 500 });
  }
});
