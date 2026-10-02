import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CheckoutError, checkoutItemsSchema, prepareCheckout } from '@/lib/checkoutService';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => null);
    const parsed = checkoutItemsSchema.safeParse(body?.items);
    if (!parsed.success) return NextResponse.json({ error: 'Valid items and whole quantities are required' }, { status: 400 });
    const { quote } = await prepareCheckout(parsed.data);
    return NextResponse.json({ success: true, quote }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Checkout quote failed:', error);
    return NextResponse.json({ error: 'Couldn’t calculate your total. Please try again.' }, { status: 500 });
  }
});
