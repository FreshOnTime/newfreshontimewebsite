import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import EnhancedOrderModel from '@/lib/models/EnhancedOrder';
import EnhancedProduct, { IProduct } from '@/lib/models/EnhancedProduct';
import mongoose from 'mongoose';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/auth';

// GET - Fetch all orders for a user
export const GET = requireAuth(async (request: NextRequest & { user?: { userId: string; role: string; mongoId?: string } }) => {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    // Prefer authenticated user's mongoId; fallback to explicit userId only for admins querying others
    const queryUserId = searchParams.get('userId');
    const authUser = request.user;
    const userId = (authUser?.mongoId || authUser?.userId);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const skip = (page - 1) * limit;
    // If admin and a different userId is provided, allow querying that user's orders
    const effectiveUserId = (authUser?.role === 'admin' && queryUserId) ? queryUserId : userId;

    const [ordersRaw, total] = await Promise.all([
      EnhancedOrderModel.find({ customerId: effectiveUserId })
        .populate({ path: 'items.productId', model: 'EnhancedProduct', select: 'name price images stockQty sku' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EnhancedOrderModel.countDocuments({ customerId: effectiveUserId })
    ]);

    // Backward-compatible recurring indicator: mark as recurring if any recurrence-related data exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: any[] = (ordersRaw as any[]).map((o) => ({
      ...o,
      isRecurring: Boolean(o?.isRecurring || o?.scheduleStatus || o?.nextDeliveryAt || (o?.recurrence && (
        (Array.isArray(o.recurrence.daysOfWeek) && o.recurrence.daysOfWeek.length) ||
        (Array.isArray(o.recurrence.includeDates) && o.recurrence.includeDates.length) ||
        (Array.isArray(o.recurrence.excludeDates) && o.recurrence.excludeDates.length) ||
        (Array.isArray(o.recurrence.selectedDates) && o.recurrence.selectedDates.length) ||
        o.recurrence.startDate || o.recurrence.endDate || o.recurrence.notes
      )))
    }));

    return NextResponse.json({
      success: true,
      data: {
  orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
});

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
  const body = await request.json();
  const { userId, items, shippingAddress, paymentMethod, notes, discount = 0, bagId, bagName, useRegisteredAddress } = body;
  // Accept isRecurring/recurrence from client, but also infer recurring when recurrence content is present
  const rawIsRecurring = body.isRecurring;
  const recurrence = body.recurrence as {
    startDate?: string;
    endDate?: string;
    daysOfWeek?: number[];
    includeDates?: string[];
    excludeDates?: string[];
    selectedDates?: string[];
    notes?: string;
  } | undefined;
  const hasRecurrenceSignals = Boolean(
    recurrence && (
      recurrence.startDate || recurrence.endDate || recurrence.notes ||
      (Array.isArray(recurrence.daysOfWeek) && recurrence.daysOfWeek.length > 0) ||
      (Array.isArray(recurrence.includeDates) && recurrence.includeDates.length > 0) ||
      (Array.isArray(recurrence.excludeDates) && recurrence.excludeDates.length > 0) ||
      (Array.isArray(recurrence.selectedDates) && recurrence.selectedDates.length > 0)
    )
  );
  const isRecurring = Boolean(rawIsRecurring) || hasRecurrenceSignals;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'User ID and items are required' },
        { status: 400 }
      );
    }

  // Load user (for optional address mapping), best-effort
  const userDoc = (await User.findById(userId).lean().catch(() => null)) as (null | {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    registrationAddress?: {
      recipientName?: string;
      streetAddress?: string;
      streetAddress2?: string;
      town?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      countryCode?: string;
      phoneNumber?: string;
    };
  });

    // Validate products and calculate totals
  const validatedItems: Array<{ productId: mongoose.Types.ObjectId; sku: string; name: string; qty: number; price: number; total: number }> = [];
    let subtotal = 0;
    
    for (const item of items) {
      // Support ObjectId, SKU, or slug identifiers
  let product: IProduct | null = null;
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await EnhancedProduct.findById(item.productId);
      }
      if (!product) {
        product = await EnhancedProduct.findOne({ $or: [ { sku: item.productId }, { slug: item.productId } ] });
      }
      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 400 }
        );
      }
      
      if ((product.stockQty ?? 0) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.name}` },
          { status: 400 }
        );
      }

      const unitPrice = Number(product.price ?? 0);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id as unknown as mongoose.Types.ObjectId,
        sku: product.sku,
        name: product.name,
        qty: item.quantity,
        price: unitPrice,
        total: itemTotal,
      });

      // Reduce stock
  // Reduce stock atomically
  await EnhancedProduct.updateOne({ _id: product._id }, { $inc: { stockQty: -item.quantity } });
    }

  // Calculate shipping/tax/total (example logic)
  const tax = 0;
  const shipping = subtotal > 50 ? 0 : 5; // Free shipping over 50
  const total = subtotal + tax + shipping - Number(discount || 0);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Map payment method to schema enum
    const pm = paymentMethod === 'cash_on_delivery' ? 'cash' : (paymentMethod || 'cash');

  // Compute nextDeliveryAt if recurring
  let nextDeliveryAt: Date | undefined = undefined;
  if (isRecurring && recurrence) {
      const now = new Date();
      const start = recurrence.startDate ? new Date(recurrence.startDate) : now;
      const days = Array.isArray(recurrence.daysOfWeek) ? recurrence.daysOfWeek.filter((d: unknown): d is number => typeof d === 'number') : [];
      const includes = Array.isArray(recurrence.includeDates) ? recurrence.includeDates.map((d: unknown) => new Date(d as string)) : [];
      const excludesKey = new Set((Array.isArray(recurrence.excludeDates) ? recurrence.excludeDates : []).map((d: unknown) => new Date(d as string).toDateString()));
      const selected = Array.isArray(recurrence.selectedDates) ? recurrence.selectedDates.map((d: unknown) => new Date(d as string)) : [];
      const candidates: Date[] = [];
      // Priority: explicit selected -> includeDates -> next matching weekday
      for (const d of [...selected, ...includes]) {
        if (d >= start && !excludesKey.has(d.toDateString())) candidates.push(d);
      }
      if (!candidates.length && days.length) {
        for (let i = 0; i < 28; i++) { // look ahead 4 weeks
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          if (days.includes(d.getDay()) && !excludesKey.has(d.toDateString())) {
            candidates.push(d);
            break;
          }
        }
      }
      nextDeliveryAt = candidates.sort((a,b) => +a - +b)[0];
    }

    // Resolve shipping address: prefer explicit shippingAddress, otherwise use user's registrationAddress when flagged or missing
    let resolvedShipping: {
      name: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone?: string;
    } | undefined = undefined;
    if (shippingAddress && typeof shippingAddress === 'object') {
      resolvedShipping = shippingAddress;
  } else if (useRegisteredAddress || (!shippingAddress && userDoc?.registrationAddress)) {
      const ra = userDoc?.registrationAddress as {
        recipientName?: string;
        streetAddress?: string;
        streetAddress2?: string;
        town?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        countryCode?: string;
        phoneNumber?: string;
      } | undefined;
      if (ra) {
        const street = [ra.streetAddress, ra.streetAddress2].filter(Boolean).join(', ');
        resolvedShipping = {
          name: ra.recipientName || `${userDoc?.firstName || ''}`.trim() || 'Customer',
          street,
          city: ra.city || ra.town || '',
          state: ra.state || '',
          zipCode: ra.postalCode || '',
          country: ra.countryCode || 'LK',
          phone: ra.phoneNumber || userDoc?.phoneNumber || '',
        };
      }
    }

    // If still no shipping address, block order creation
    if (!resolvedShipping) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    const newOrder = new EnhancedOrderModel({
      orderNumber,
      bagId: bagId && mongoose.Types.ObjectId.isValid(bagId) ? new mongoose.Types.ObjectId(bagId) : undefined,
      bagName,
      customerId: userId,
      items: validatedItems,
      subtotal,
      tax,
      shipping,
      discount: Number(discount || 0),
      total,
      paymentMethod: pm,
      shippingAddress: resolvedShipping,
      notes,
      isRecurring,
      recurrence: isRecurring ? {
        startDate: recurrence?.startDate,
        endDate: recurrence?.endDate,
        daysOfWeek: recurrence?.daysOfWeek,
        includeDates: recurrence?.includeDates,
        excludeDates: recurrence?.excludeDates,
        selectedDates: recurrence?.selectedDates,
        notes: recurrence?.notes,
      } : undefined,
      nextDeliveryAt,
      scheduleStatus: isRecurring ? 'active' : undefined,
    });

    const savedOrder = await newOrder.save();
    
    const populatedOrder = await EnhancedOrderModel.findById(savedOrder._id)
      .populate({ path: 'items.productId', model: 'EnhancedProduct', select: 'name price images stockQty sku' });

    return NextResponse.json({
      success: true,
      data: populatedOrder
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
