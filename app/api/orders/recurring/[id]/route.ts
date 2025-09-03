import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Order from '@/lib/models/EnhancedOrder';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import { requireAuth } from '@/lib/auth';
import { RecurringOrderService } from '@/lib/services/recurringOrderService';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    role: string;
  };
}

// Validation schema for updating recurring order
const updateRecurringOrderSchema = z.object({
  isRecurring: z.boolean().optional(),
  // Allow customers to update items by productId/qty; server derives price/name/sku
  items: z.array(z.object({
    productId: z.string().min(1),
    qty: z.number().int().min(1),
  })).min(1).optional(),
  recurrence: z.object({
  // Accept ISO string, date-only string, or Date
  startDate: z.union([z.string().datetime(), z.string(), z.date()]).optional(),
  endDate: z.union([z.string().datetime(), z.string(), z.date()]).optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  includeDates: z.array(z.union([z.string().datetime(), z.string(), z.date()])).optional(),
  excludeDates: z.array(z.union([z.string().datetime(), z.string(), z.date()])).optional(),
  selectedDates: z.array(z.union([z.string().datetime(), z.string(), z.date()])).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  scheduleStatus: z.enum(['active', 'paused', 'ended']).optional(),
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }).optional(),
  notes: z.string().max(1000).optional(),
});

// GET - fetch single recurring order
export const GET = requireAuth(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
  const { id } = context!.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const user = (request as AuthenticatedRequest).user;
    
    const order = await Order.findById(id)
      .populate({ 
        path: 'items.productId', 
        model: 'EnhancedProduct', 
        select: 'name price images stockQty sku' 
      });

    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching recurring order:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch recurring order' 
    }, { status: 500 });
  }
});

// PUT - update recurring order
export const PUT = requireAuth(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
  const { id } = context!.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const user = (request as AuthenticatedRequest).user;

    // Validate the request body
    const data = updateRecurringOrderSchema.parse(body);

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

  // Prepare update object
  const update: Record<string, unknown> = {};

    // Update basic fields
    if (typeof data.isRecurring === 'boolean') {
      update.isRecurring = data.isRecurring;
    }
    
    if (typeof data.scheduleStatus === 'string') {
      update.scheduleStatus = data.scheduleStatus;
    }

    if (data.nextDeliveryAt) {
      update.nextDeliveryAt = new Date(data.nextDeliveryAt);
    }

    if (data.shippingAddress) {
      update.shippingAddress = data.shippingAddress;
    }

    if (typeof data.notes === 'string') {
      update.notes = data.notes;
    }

    // If items are provided, rebuild items and recalculate totals from current product data
    if (data.items && data.items.length > 0) {
      // Load products
      const productIds = Array.from(new Set(data.items.map(i => i.productId)));
      const products = await EnhancedProduct.find({ _id: { $in: productIds } }).lean();

      type LeanProduct = { _id: mongoose.Types.ObjectId | string; sku?: string; name?: string; price?: number };
      const productMap = new Map<string, LeanProduct>(
        (products as unknown as LeanProduct[]).map((p) => {
          const id = p._id;
          const key = typeof id === 'string' ? id : id.toString();
          return [key, p];
        })
      );

      // Validate all products exist
      const missing = data.items.filter(i => !productMap.has(i.productId)).map(i => i.productId);
      if (missing.length) {
        return NextResponse.json({ error: 'Some products not found', missing }, { status: 400 });
      }

      // Build order items using current product data
      const rebuiltItems = data.items.map(i => {
        const p = productMap.get(i.productId)!;
        const price = typeof p.price === 'number' ? p.price : 0;
        const total = price * i.qty;
        const pid = typeof p._id === 'string' ? new mongoose.Types.ObjectId(p._id) : p._id;
        return {
          productId: pid,
          sku: String(p.sku || ''),
          name: String(p.name || ''),
          qty: i.qty,
          price,
          total,
        };
      });

      const newSubtotal = rebuiltItems.reduce((sum, it) => sum + it.total, 0);
      const tax = typeof (order.tax as number) === 'number' ? (order.tax as number) : 0;
      const shipping = typeof (order.shipping as number) === 'number' ? (order.shipping as number) : 0;
      const discount = typeof (order.discount as number) === 'number' ? (order.discount as number) : 0;
      const newTotal = Math.max(0, newSubtotal + tax + shipping - discount);

      update.items = rebuiltItems;
      update.subtotal = newSubtotal;
      update.total = newTotal;
    }

    // Update recurrence object
    if (data.recurrence) {
      const recurrenceUpdate: Record<string, unknown> = {};
      
      if (data.recurrence.startDate) {
        recurrenceUpdate.startDate = new Date(data.recurrence.startDate as unknown as string);
      }
      
      if (data.recurrence.endDate) {
        recurrenceUpdate.endDate = new Date(data.recurrence.endDate as unknown as string);
      }
      
      if (data.recurrence.daysOfWeek) {
        recurrenceUpdate.daysOfWeek = data.recurrence.daysOfWeek;
      }
      
      if (data.recurrence.includeDates) {
        recurrenceUpdate.includeDates = data.recurrence.includeDates.map(d => new Date(d as unknown as string));
      }
      
      if (data.recurrence.excludeDates) {
        recurrenceUpdate.excludeDates = data.recurrence.excludeDates.map(d => new Date(d as unknown as string));
      }
      
      if (data.recurrence.selectedDates) {
        recurrenceUpdate.selectedDates = data.recurrence.selectedDates.map(d => new Date(d as unknown as string));
      }
      
      if (typeof data.recurrence.notes === 'string') {
        recurrenceUpdate.notes = data.recurrence.notes;
      }

      // Merge with existing recurrence data
      update.recurrence = {
        ...order.recurrence,
        ...recurrenceUpdate,
      };

      // Validate start/end logical order and recurrence pattern
      const rec = update.recurrence as {
        startDate?: Date;
        endDate?: Date;
        daysOfWeek?: number[];
        includeDates?: Date[];
        excludeDates?: Date[];
        selectedDates?: Date[];
        notes?: string;
      };
      if (rec.startDate && rec.endDate && rec.startDate >= rec.endDate) {
        return NextResponse.json({ 
          error: 'Start date must be before end date' 
        }, { status: 400 });
      }

      const validation = RecurringOrderService.validateRecurrencePattern(rec);
      if (!validation.valid) {
        return NextResponse.json({ 
          error: 'Invalid recurrence pattern', 
          details: validation.errors 
        }, { status: 400 });
      }
    }

    // If recurrence changed but nextDeliveryAt wasn't explicitly provided, recalculate
    if (update.recurrence && !data.nextDeliveryAt) {
      type RecurrenceDef = {
        startDate?: Date;
        endDate?: Date;
        daysOfWeek?: number[];
        includeDates?: Date[];
        excludeDates?: Date[];
        selectedDates?: Date[];
        notes?: string;
      };
      const pattern = { recurrence: update.recurrence as RecurrenceDef } as unknown as import('@/lib/services/recurringOrderService').RecurringOrderPattern;
      const next = RecurringOrderService.calculateNextDelivery(pattern, new Date());
      if (next) {
        // Only set if user didn't explicitly pause/end
        if (!update.scheduleStatus) update.scheduleStatus = 'active';
        update.nextDeliveryAt = next;
      } else {
  if (!update.scheduleStatus) update.scheduleStatus = 'ended';
  update.nextDeliveryAt = null;
      }
    }

    // If user wants to activate but didn't provide nextDeliveryAt, compute using current or updated recurrence
    if (data.scheduleStatus === 'active' && !data.nextDeliveryAt && !update.nextDeliveryAt) {
      const rec = (update.recurrence ?? order.recurrence) as {
        startDate?: Date;
        endDate?: Date;
        daysOfWeek?: number[];
        includeDates?: Date[];
        excludeDates?: Date[];
        selectedDates?: Date[];
        notes?: string;
      } | undefined;
      if (rec) {
        const pattern = { recurrence: rec } as unknown as import('@/lib/services/recurringOrderService').RecurringOrderPattern;
        const next = RecurringOrderService.calculateNextDelivery(pattern, new Date());
        update.nextDeliveryAt = next ?? null;
        if (!next) update.scheduleStatus = 'ended';
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { $set: update }, 
      { new: true, runValidators: true }
    ).populate({ 
      path: 'items.productId', 
      model: 'EnhancedProduct', 
      select: 'name price images stockQty sku' 
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Recurring order updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error updating recurring order:', error);
    return NextResponse.json({ 
      error: 'Failed to update recurring order' 
    }, { status: 500 });
  }
});

// DELETE - delete/cancel recurring order
export const DELETE = requireAuth(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
  const { id } = context!.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const user = (request as AuthenticatedRequest).user;
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For users, just end the recurring schedule instead of deleting
    if (user.role !== 'admin') {
      const updated = await Order.findByIdAndUpdate(
        id,
        { 
          $set: { 
            scheduleStatus: 'ended',
            nextDeliveryAt: null,
          }
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Recurring order schedule ended successfully',
      });
    }

    // Admin can actually delete the order
    // First, restore stock for items if order is not delivered
    const shouldRestoreStock = !['delivered', 'shipped'].includes(order.status || '');
    
    if (shouldRestoreStock) {
      try {
        await Promise.all((order.items || []).map(async (item: unknown) => {
          const it = item as { productId: unknown; qty: number };
          if (it && it.productId) {
            const pid = typeof it.productId === 'object' && it.productId && '_id' in it.productId 
              ? (it.productId as { _id: string })._id 
              : it.productId;
            
            if (mongoose.Types.ObjectId.isValid(String(pid))) {
              await EnhancedProduct.updateOne(
                { _id: pid }, 
                { $inc: { stockQty: it.qty || 0 } }
              ).catch(() => null);
            }
          }
        }));
      } catch (e) {
        console.error('Error restoring stock on delete:', e);
      }
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Recurring order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting recurring order:', error);
    return NextResponse.json({ 
      error: 'Failed to delete recurring order' 
    }, { status: 500 });
  }
});

// PATCH - quick actions (pause, resume, end)
export const PATCH = requireAuth(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
  const { id } = context!.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const user = (request as AuthenticatedRequest).user;

    if (!body.action || !['pause', 'resume', 'end'].includes(body.action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be pause, resume, or end' 
      }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let update: Record<string, unknown> = {};
    let message = '';

    switch (body.action) {
      case 'pause':
        update = { scheduleStatus: 'paused' };
        message = 'Recurring order paused successfully';
        break;
      case 'resume': {
        const rec = order.recurrence as {
          startDate?: Date;
          endDate?: Date;
          daysOfWeek?: number[];
          includeDates?: Date[];
          excludeDates?: Date[];
          selectedDates?: Date[];
          notes?: string;
        } | undefined;
        let next: Date | null = null;
        if (rec) {
          const pattern = { recurrence: rec } as unknown as import('@/lib/services/recurringOrderService').RecurringOrderPattern;
          next = RecurringOrderService.calculateNextDelivery(pattern, new Date());
        }
        update = { scheduleStatus: next ? 'active' : 'ended', nextDeliveryAt: next };
        message = next ? 'Recurring order resumed successfully' : 'Cannot resume: no future delivery dates in recurrence. Please update start/end dates or schedule.';
        break; }
      case 'end':
        update = { 
          scheduleStatus: 'ended',
          nextDeliveryAt: null,
        };
        message = 'Recurring order ended successfully';
        break;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).populate({ 
      path: 'items.productId', 
      model: 'EnhancedProduct', 
      select: 'name price images stockQty sku' 
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message,
    });
  } catch (error) {
    console.error('Error performing recurring order action:', error);
    return NextResponse.json({ 
      error: 'Failed to perform action on recurring order' 
    }, { status: 500 });
  }
});
