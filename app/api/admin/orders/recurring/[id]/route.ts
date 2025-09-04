import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Order from '@/lib/models/EnhancedOrder';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';
import { RecurringOrderService } from '@/lib/services/recurringOrderService';
import Customer from '@/lib/models/Customer';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    role: string;
  };
}

// Comprehensive validation schema for admin updates
const adminUpdateRecurringOrderSchema = z.object({
  // Basic order fields
  status: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  paymentStatus: z.enum(['pending','paid','failed','refunded']).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  
  // Recurring-specific fields
  isRecurring: z.boolean().optional(),
  scheduleStatus: z.enum(['active', 'paused', 'ended']).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  
  // Recurrence pattern
  recurrence: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    includeDates: z.array(z.string().datetime()).optional(),
    excludeDates: z.array(z.string().datetime()).optional(),
    selectedDates: z.array(z.string().datetime()).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
  
  // Address updates
  shippingAddress: z.object({
  name: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  
  billingAddress: z.object({
  name: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  }).optional(),
  
  // Delivery fields
  estimatedDelivery: z.string().datetime().optional(),
  actualDelivery: z.string().datetime().optional(),
  
  // Financial fields
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
});

// GET - fetch single recurring order (admin)
export const GET = requireAdmin(async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    await connectDB();
  const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await Order.findById(id)
      .populate({ 
        path: 'items.productId', 
        model: 'EnhancedProduct', 
        select: 'name price images stockQty sku' 
      })
      .populate({
        path: 'customerId',
        model: 'Customer',
        select: 'name email phone address',
      });

    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Get related orders (if any) for this recurring pattern
    const relatedOrders = await Order.find({
      customerId: order.customerId,
      isRecurring: true,
      _id: { $ne: order._id },
      'recurrence.startDate': order.recurrence?.startDate,
      'recurrence.daysOfWeek': order.recurrence?.daysOfWeek,
    })
    .select('_id orderNumber status createdAt nextDeliveryAt scheduleStatus')
    .sort({ createdAt: -1 })
    .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        order,
        relatedOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching recurring order (admin):', error);
    return NextResponse.json({ 
      error: 'Failed to fetch recurring order' 
    }, { status: 500 });
  }
});

// PUT - comprehensive update of recurring order (admin)
export const PUT = requireAdmin(async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    await connectDB();
  const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();

    // Validate the request body
    const data = adminUpdateRecurringOrderSchema.parse(body);

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Store before state for audit log
  const beforeState = order.toObject() as unknown as Record<string, unknown>;

    // Prepare update object
    const update: Record<string, unknown> = {};

    // Basic order fields
    if (data.status) update.status = data.status;
    if (data.paymentStatus) update.paymentStatus = data.paymentStatus;
    if (data.trackingNumber !== undefined) update.trackingNumber = data.trackingNumber;
    if (data.notes !== undefined) update.notes = data.notes;

    // Customer change (admin only)
    if (data.customerId && data.customerId !== String(order.customerId)) {
      if (!mongoose.Types.ObjectId.isValid(data.customerId)) {
        return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
      }
      const customerExists = await Customer.exists({ _id: data.customerId });
      if (!customerExists) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      update.customerId = new mongoose.Types.ObjectId(data.customerId);
    }

    // Recurring fields
    if (typeof data.isRecurring === 'boolean') update.isRecurring = data.isRecurring;
    if (data.scheduleStatus) update.scheduleStatus = data.scheduleStatus;
    if (data.nextDeliveryAt) update.nextDeliveryAt = new Date(data.nextDeliveryAt);

    // Address updates (merge partials to satisfy required fields)
    const stripUndefined = <T extends Record<string, unknown>>(obj: T | undefined): Partial<T> | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;
      const entries = Object.entries(obj).filter(([, v]) => typeof v !== 'undefined' && v !== null);
      if (entries.length === 0) return undefined;
      return Object.fromEntries(entries) as Partial<T>;
    };
    const mergeAddr = (prev: Record<string, unknown> | undefined, partial: Record<string, unknown> | undefined) => {
      const clean = stripUndefined(partial);
      if (!clean) return undefined;
      return { ...(prev || {}), ...clean };
    };
    if (typeof data.shippingAddress !== 'undefined') {
      const merged = mergeAddr(order.shippingAddress as unknown as Record<string, unknown>, data.shippingAddress as unknown as Record<string, unknown>);
      if (merged) update.shippingAddress = merged;
    }
    if (typeof data.billingAddress !== 'undefined') {
      const merged = mergeAddr(order.billingAddress as unknown as Record<string, unknown>, data.billingAddress as unknown as Record<string, unknown>);
      if (merged) update.billingAddress = merged;
    }

    // Delivery dates
    if (data.estimatedDelivery) update.estimatedDelivery = new Date(data.estimatedDelivery);
    if (data.actualDelivery) update.actualDelivery = new Date(data.actualDelivery);

    // Financial fields
    if (typeof data.subtotal === 'number') update.subtotal = data.subtotal;
    if (typeof data.tax === 'number') update.tax = data.tax;
    if (typeof data.shipping === 'number') update.shipping = data.shipping;
    if (typeof data.discount === 'number') update.discount = data.discount;
    if (typeof data.total === 'number') update.total = data.total;

  // Update recurrence object
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
        if (!update.scheduleStatus) update.scheduleStatus = 'active';
        update.nextDeliveryAt = next;
      } else {
        if (!update.scheduleStatus) update.scheduleStatus = 'ended';
        update.nextDeliveryAt = null as unknown as undefined;
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { $set: update }, 
      { new: true, runValidators: true }
    )
    .populate({ 
      path: 'items.productId', 
      model: 'EnhancedProduct', 
      select: 'name price images stockQty sku' 
    })
    .populate({
      path: 'customerId',
      model: 'Customer',
      select: 'name email phone',
    });

    // Log audit action
    await logAuditAction(
      (request as AuthenticatedRequest).user.userId,
      'update',
      'order',
      id,
      beforeState,
  (updatedOrder?.toObject() as unknown) as Record<string, unknown> | undefined,
      request
    );

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
    console.error('Error updating recurring order (admin):', error);
    return NextResponse.json({ 
      error: 'Failed to update recurring order' 
    }, { status: 500 });
  }
});

// DELETE - delete recurring order (admin only)
export const DELETE = requireAdmin(async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    await connectDB();
  const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Store before state for audit log
  const beforeState = order.toObject() as unknown as Record<string, unknown>;

    // Restore stock for items if order is not delivered
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

    // Log audit action
  await logAuditAction(
      (request as AuthenticatedRequest).user.userId,
      'delete',
      'order',
      id,
      beforeState,
      undefined,
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Recurring order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting recurring order (admin):', error);
    return NextResponse.json({ 
      error: 'Failed to delete recurring order' 
    }, { status: 500 });
  }
});

// PATCH - admin quick actions and special operations
export const PATCH = requireAdmin(async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    await connectDB();
  const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();

    const actionSchema = z.object({
      action: z.enum(['pause', 'resume', 'end', 'force_next_delivery', 'skip_next_delivery', 'duplicate']),
      nextDeliveryAt: z.string().datetime().optional(),
    });

    const { action, nextDeliveryAt } = actionSchema.parse(body);

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

  const beforeState = order.toObject() as unknown as Record<string, unknown>;
    let update: Record<string, unknown> = {};
    let message = '';
    let newOrder = null;

    switch (action) {
      case 'pause':
        update = { scheduleStatus: 'paused' };
        message = 'Recurring order paused successfully';
        break;
      case 'resume':
        update = { scheduleStatus: 'active' };
        message = 'Recurring order resumed successfully';
        break;
      case 'end':
        update = { 
          scheduleStatus: 'ended',
          nextDeliveryAt: null,
        };
        message = 'Recurring order ended successfully';
        break;
      case 'force_next_delivery':
        if (!nextDeliveryAt) {
          return NextResponse.json({ 
            error: 'nextDeliveryAt is required for force_next_delivery action' 
          }, { status: 400 });
        }
        update = { nextDeliveryAt: new Date(nextDeliveryAt) };
        message = 'Next delivery date updated successfully';
        break;
      case 'skip_next_delivery':
        // Logic to calculate next delivery after the current next delivery
        const currentNext = order.nextDeliveryAt;
        if (currentNext && order.recurrence?.daysOfWeek) {
          // Simple logic: add 7 days if weekly pattern
          const newNext = new Date(currentNext);
          newNext.setDate(newNext.getDate() + 7);
          update = { nextDeliveryAt: newNext };
        } else {
          return NextResponse.json({ 
            error: 'Cannot skip delivery without proper recurrence pattern' 
          }, { status: 400 });
        }
        message = 'Next delivery skipped successfully';
        break;
      case 'duplicate':
        // Create a new recurring order based on this one
        const duplicateData = {
          ...order.toObject(),
          _id: new mongoose.Types.ObjectId(),
          orderNumber: `DUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'pending',
          scheduleStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Remove version key if it exists
        if ('__v' in duplicateData) {
          delete (duplicateData as Record<string, unknown>).__v;
        }

        newOrder = new Order(duplicateData);
        await newOrder.save();
        
        const populatedNewOrder = await Order.findById(newOrder._id)
          .populate({ 
            path: 'items.productId', 
            model: 'EnhancedProduct', 
            select: 'name price images stockQty sku' 
          });

        message = 'Recurring order duplicated successfully';
        
        // Log the duplication
        await logAuditAction(
          (request as AuthenticatedRequest).user.userId,
          'duplicate',
          'order',
          id,
          beforeState,
          (populatedNewOrder?.toObject() as unknown) as Record<string, unknown> | undefined,
          request
        );

        return NextResponse.json({
          success: true,
          data: populatedNewOrder,
          message,
        });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    )
    .populate({ 
      path: 'items.productId', 
      model: 'EnhancedProduct', 
      select: 'name price images stockQty sku' 
    })
    .populate({
      path: 'customerId',
      model: 'Customer',
      select: 'name email phone',
    });

    // Log audit action
    await logAuditAction(
      (request as AuthenticatedRequest).user.userId,
      action,
      'order',
      id,
      beforeState,
  (updatedOrder?.toObject() as unknown) as Record<string, unknown> | undefined,
      request
    );

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error performing admin action on recurring order:', error);
    return NextResponse.json({ 
      error: 'Failed to perform action on recurring order' 
    }, { status: 500 });
  }
});
