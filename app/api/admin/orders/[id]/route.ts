import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Order from '@/lib/models/EnhancedOrder';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

// Accept partial updates; addresses allow undefined keys (we'll sanitize/merge later)
const updateSchema = z.object({
  status: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  paymentStatus: z.enum(['pending','paid','failed','refunded']).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
  // Items and totals (allow editing products of the order)
  items: z.array(z.object({
    productId: z.string().min(1),
    sku: z.string().min(1),
    name: z.string().min(1),
    qty: z.number().int().min(1),
    price: z.number().min(0),
    total: z.number().min(0),
  })).optional(),
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  shippingAddress: z.object({
    name: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
  }).partial().optional(),
  billingAddress: z.object({
    name: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).partial().optional(),
  // Recurring controls
  scheduleStatus: z.enum(['active','paused','ended']).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    includeDates: z.array(z.string().datetime()).optional(),
    excludeDates: z.array(z.string().datetime()).optional(),
    selectedDates: z.array(z.string().datetime()).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
});

export const GET = requireAdmin(async (_request, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
  const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const body = await request.json();
  const data = updateSchema.parse(body);
  const before = await Order.findById(id);
    if (!before) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
  const update: Record<string, unknown> = {};
  // Shallow copy simple fields
  if (typeof data.status !== 'undefined') update.status = data.status;
  if (typeof data.paymentStatus !== 'undefined') update.paymentStatus = data.paymentStatus;
  if (typeof data.trackingNumber !== 'undefined') update.trackingNumber = data.trackingNumber;
  if (typeof data.notes !== 'undefined') update.notes = data.notes;
    if (data.nextDeliveryAt) {
      update.nextDeliveryAt = new Date(data.nextDeliveryAt);
    }
    // Helper to remove undefined fields from a partial object
    const stripUndefined = <T extends Record<string, unknown>>(obj: T | undefined): Partial<T> | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;
      const entries = Object.entries(obj).filter(([, v]) => typeof v !== 'undefined' && v !== null);
      if (entries.length === 0) return undefined;
      return Object.fromEntries(entries) as Partial<T>;
    };

    // Merge partial address updates with existing values to satisfy schema required fields
    const mergeAddress = (prev: Record<string, unknown> | undefined, partial: Record<string, unknown> | undefined) => {
      const clean = stripUndefined(partial);
      if (!clean) return undefined; // ignore empty objects
      return { ...(prev || {}), ...clean };
    };

    if (typeof data.shippingAddress !== 'undefined') {
      const merged = mergeAddress((before.shippingAddress as unknown as Record<string, unknown>), data.shippingAddress as unknown as Record<string, unknown>);
      if (merged) update.shippingAddress = merged;
    }
    if (typeof data.billingAddress !== 'undefined') {
      const merged = mergeAddress((before.billingAddress as unknown as Record<string, unknown>), data.billingAddress as unknown as Record<string, unknown>);
      if (merged) update.billingAddress = merged;
    }

    // Handle items update and totals
    if (data.items) {
      update.items = data.items.map(it => ({
        productId: new mongoose.Types.ObjectId(it.productId),
        sku: it.sku,
        name: it.name,
        qty: it.qty,
        price: it.price,
        total: it.total,
      }));

      // Compute subtotal from items when not provided
      const computedSubtotal = data.items.reduce((s, it) => s + (it.price * it.qty), 0);
      update.subtotal = typeof data.subtotal === 'number' ? data.subtotal : Number(computedSubtotal.toFixed(2));

      // Preserve previous charges if not provided
      const tax = typeof data.tax === 'number' ? data.tax : (before.tax || 0);
      const shipping = typeof data.shipping === 'number' ? data.shipping : (before.shipping || 0);
      const discount = typeof data.discount === 'number' ? data.discount : (before.discount || 0);
      update.tax = tax;
      update.shipping = shipping;
      update.discount = discount;

      const total = typeof data.total === 'number'
        ? data.total
        : Number(((update.subtotal as number) + tax + shipping - discount).toFixed(2));
      update.total = total;
    } else {
      // If only totals provided, accept them (admin may adjust charges without touching items)
      if (typeof data.subtotal === 'number') update.subtotal = data.subtotal;
      if (typeof data.tax === 'number') update.tax = data.tax;
      if (typeof data.shipping === 'number') update.shipping = data.shipping;
      if (typeof data.discount === 'number') update.discount = data.discount;
      if (typeof data.total === 'number') update.total = data.total;
    }
    
    // Handle recurrence updates
    if (data.recurrence) {
      const recurrenceUpdate: Record<string, unknown> = {};
      
      if (data.recurrence.startDate) {
        recurrenceUpdate.startDate = new Date(data.recurrence.startDate);
      }
      
      if (data.recurrence.endDate) {
        recurrenceUpdate.endDate = new Date(data.recurrence.endDate);
      }
      
      if (data.recurrence.daysOfWeek) {
        recurrenceUpdate.daysOfWeek = data.recurrence.daysOfWeek;
      }
      
      if (data.recurrence.includeDates) {
        recurrenceUpdate.includeDates = data.recurrence.includeDates.map(d => new Date(d));
      }
      
      if (data.recurrence.excludeDates) {
        recurrenceUpdate.excludeDates = data.recurrence.excludeDates.map(d => new Date(d));
      }
      
      if (data.recurrence.selectedDates) {
        recurrenceUpdate.selectedDates = data.recurrence.selectedDates.map(d => new Date(d));
      }
      
      if (typeof data.recurrence.notes === 'string') {
        recurrenceUpdate.notes = data.recurrence.notes;
      }

      // Merge with existing recurrence data or create new one
      update.recurrence = {
        ...before.recurrence,
        ...recurrenceUpdate,
      };
    }
    const updated = await Order.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    await logAuditAction(
      request.user!.userId,
      'update',
      'order',
      id,
      (before.toObject() as unknown) as Record<string, unknown>,
      (updated!.toObject() as unknown) as Record<string, unknown>,
      request
    );
    return NextResponse.json({ order: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
  const before = await Order.findById(id).lean();
    if (!before) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

  await Order.findByIdAndDelete(id);
  await logAuditAction(request.user!.userId, 'delete', 'order', id, before, undefined, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
});
