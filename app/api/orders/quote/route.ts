import { DeliveryPolicyError, assertDeliveryArea } from '@/lib/deliveryPolicy';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CheckoutError, checkoutItemsSchema, prepareCheckout } from '@/lib/checkoutService';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => null);
    const parsed = checkoutItemsSchema.safeParse(body?.items);
    if (!parsed.success) return NextResponse.json({ error: 'Valid items and whole quantities are required' }, { status: 400 });
    if (body.deliveryAddress) {
      if (typeof body.deliveryAddress.city !== 'string' || typeof body.deliveryAddress.country !== 'string') return NextResponse.json({ error: 'Choose a delivery city and country' }, { status: 400 });
      assertDeliveryArea(body.deliveryAddress);
    }
    const { quote } = await prepareCheckout(parsed.data);
    return NextResponse.json({ success: true, quote }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof CheckoutError || error instanceof DeliveryPolicyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Checkout quote failed:', error);
    return NextResponse.json({ error: 'Couldn’t calculate your total. Please try again.' }, { status: 500 });
  }
});
