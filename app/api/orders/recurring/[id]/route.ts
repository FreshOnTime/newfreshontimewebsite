import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, type ScheduleStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

type AuthUser = { userId: string; role: string; mongoId?: string };
type RecurringOrderRouteContext = { params: Promise<{ id: string }> };

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, price: true, images: true, stockQty: true, sku: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type RecurringOrderWithItems = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

async function getRouteId(context?: RecurringOrderRouteContext): Promise<string | null> {
  const params = await context?.params;
  return params?.id || null;
}

function serializeOrder(o: RecurringOrderWithItems) {
  const { items, ...rest } = o;
  return {
    ...rest,
    _id: o.id,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    shipping: Number(o.shipping),
    discount: Number(o.discount),
    total: Number(o.total),
    items: (items || []).map((it) => {
      const { product, ...itRest } = it;
      return {
        ...itRest,
        price: Number(it.price),
        total: Number(it.total),
        productId: product
          ? {
              _id: product.id,
              name: product.name,
              price: Number(product.price),
              images: product.images,
              stockQty: product.stockQty,
              sku: product.sku,
            }
          : it.productId,
      };
    }),
  };
}

type StoredRecurrence = {
  startDate?: string | Date;
  endDate?: string | Date;
  daysOfWeek?: number[];
  includeDates?: (string | Date)[];
  excludeDates?: (string | Date)[];
  selectedDates?: (string | Date)[];
  notes?: string;
};

type HydratedRecurrence = {
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[];
  includeDates?: Date[];
  excludeDates?: Date[];
  selectedDates?: Date[];
  notes?: string;
};

// recurrence is a JSON column now, so its dates come back as ISO strings.
// Hydrate them to Date objects for calculation/validation, dehydrate for storage.
function hydrateRecurrence(rec: unknown): HydratedRecurrence | undefined {
  if (!rec || typeof rec !== 'object') return undefined;
  const r = rec as StoredRecurrence;
  const h: HydratedRecurrence = {};
  if (r.startDate) h.startDate = new Date(r.startDate);
  if (r.endDate) h.endDate = new Date(r.endDate);
  if (r.daysOfWeek) h.daysOfWeek = r.daysOfWeek;
  if (r.includeDates) h.includeDates = r.includeDates.map((d) => new Date(d));
  if (r.excludeDates) h.excludeDates = r.excludeDates.map((d) => new Date(d));
  if (r.selectedDates) h.selectedDates = r.selectedDates.map((d) => new Date(d));
  if (typeof r.notes === 'string') h.notes = r.notes;
  return h;
}

function dehydrateRecurrence(rec: HydratedRecurrence): Prisma.InputJsonValue {
  const out: Record<string, unknown> = {};
  if (rec.startDate) out.startDate = rec.startDate.toISOString();
  if (rec.endDate) out.endDate = rec.endDate.toISOString();
  if (rec.daysOfWeek) out.daysOfWeek = rec.daysOfWeek;
  if (rec.includeDates) out.includeDates = rec.includeDates.map((d) => d.toISOString());
  if (rec.excludeDates) out.excludeDates = rec.excludeDates.map((d) => d.toISOString());
  if (rec.selectedDates) out.selectedDates = rec.selectedDates.map((d) => d.toISOString());
  if (typeof rec.notes === 'string') out.notes = rec.notes;
  return out as Prisma.InputJsonValue;
}

function calculateNextDelivery(recurrence: HydratedRecurrence, fromDate = new Date()): Date | null {
  const start = recurrence.startDate && recurrence.startDate > fromDate ? recurrence.startDate : fromDate;
  const end = recurrence.endDate;
  const excluded = new Set((recurrence.excludeDates || []).map((d) => d.toDateString()));

  const explicitDates = [...(recurrence.selectedDates || []), ...(recurrence.includeDates || [])]
    .filter((d) => d >= start && (!end || d <= end) && !excluded.has(d.toDateString()))
    .sort((a, b) => +a - +b);
  if (explicitDates.length) return explicitDates[0];

  const days = recurrence.daysOfWeek || [];
  if (!days.length) return null;

  for (let i = 0; i <= 366; i++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + i);
    if (end && candidate > end) return null;
    if (days.includes(candidate.getDay()) && !excluded.has(candidate.toDateString())) return candidate;
  }

  return null;
}

function validateRecurrencePattern(recurrence: HydratedRecurrence): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (recurrence.startDate && recurrence.endDate && recurrence.startDate >= recurrence.endDate) {
    errors.push('Start date must be before end date');
  }
  if (
    !recurrence.daysOfWeek?.length &&
    !recurrence.includeDates?.length &&
    !recurrence.selectedDates?.length
  ) {
    errors.push('Select at least one delivery day or date');
  }
  return { valid: errors.length === 0, errors };
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
export const GET = requireAuth(async (request: NextRequest, context?: RecurringOrderRouteContext) => {
  try {
    const id = await getRouteId(context);
    if (!id) {
      return NextResponse.json({ error: 'Recurring order id is required' }, { status: 400 });
    }

    const user = (request as NextRequest & { user: AuthUser }).user;

    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });

    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.mongoId || user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: serializeOrder(order),
    });
  } catch (error) {
    console.error('Error fetching recurring order:', error);
    return NextResponse.json({
      error: 'Failed to fetch recurring order'
    }, { status: 500 });
  }
});

// PUT - update recurring order
export const PUT = requireAuth(async (request: NextRequest, context?: RecurringOrderRouteContext) => {
  try {
    const id = await getRouteId(context);
    if (!id) {
      return NextResponse.json({ error: 'Recurring order id is required' }, { status: 400 });
    }

    const body = await request.json();
    const user = (request as NextRequest & { user: AuthUser }).user;

    // Validate the request body
    const data = updateRecurringOrderSchema.parse(body);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.mongoId || user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare update object
    const updateData: Prisma.OrderUpdateInput = {};

    if (typeof data.isRecurring === 'boolean') {
      updateData.isRecurring = data.isRecurring;
    }

    if (typeof data.scheduleStatus === 'string') {
      updateData.scheduleStatus = data.scheduleStatus as ScheduleStatus;
    }

    if (data.nextDeliveryAt) {
      updateData.nextDeliveryAt = new Date(data.nextDeliveryAt);
    }

    if (data.shippingAddress) {
      updateData.shippingAddress = data.shippingAddress as Prisma.InputJsonValue;
    }

    if (typeof data.notes === 'string') {
      updateData.notes = data.notes;
    }

    // If items are provided, rebuild items and recalculate totals from current product data
    if (data.items && data.items.length > 0) {
      const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validate all products exist
      const missing = data.items.filter((i) => !productMap.has(i.productId)).map((i) => i.productId);
      if (missing.length) {
        return NextResponse.json({ error: 'Some products not found', missing }, { status: 400 });
      }

      // Build order items using current product data
      const rebuiltItems = data.items.map((i) => {
        const p = productMap.get(i.productId)!;
        const price = Number(p.price);
        const total = price * i.qty;
        return {
          productId: p.id,
          sku: String(p.sku || ''),
          name: String(p.name || ''),
          qty: i.qty,
          price,
          total,
        };
      });

      const newSubtotal = rebuiltItems.reduce((sum, it) => sum + it.total, 0);
      const tax = Number(order.tax);
      const shipping = Number(order.shipping);
      const discount = Number(order.discount);
      const newTotal = Math.max(0, newSubtotal + tax + shipping - discount);

      // Replace the order's line items atomically.
      updateData.items = { deleteMany: {}, create: rebuiltItems };
      updateData.subtotal = newSubtotal;
      updateData.total = newTotal;
    }

    // Update recurrence object
    let mergedRecurrence: HydratedRecurrence | undefined;
    if (data.recurrence) {
      const recurrenceUpdate: HydratedRecurrence = {};

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
        recurrenceUpdate.includeDates = data.recurrence.includeDates.map((d) => new Date(d));
      }
      if (data.recurrence.excludeDates) {
        recurrenceUpdate.excludeDates = data.recurrence.excludeDates.map((d) => new Date(d));
      }
      if (data.recurrence.selectedDates) {
        recurrenceUpdate.selectedDates = data.recurrence.selectedDates.map((d) => new Date(d));
      }
      if (typeof data.recurrence.notes === 'string') {
        recurrenceUpdate.notes = data.recurrence.notes;
      }

      // Merge with existing recurrence data
      mergedRecurrence = {
        ...(hydrateRecurrence(order.recurrence) || {}),
        ...recurrenceUpdate,
      };

      // Validate start/end logical order and recurrence pattern
      if (mergedRecurrence.startDate && mergedRecurrence.endDate && mergedRecurrence.startDate >= mergedRecurrence.endDate) {
        return NextResponse.json({
          error: 'Start date must be before end date'
        }, { status: 400 });
      }

      const validation = validateRecurrencePattern(mergedRecurrence);
      if (!validation.valid) {
        return NextResponse.json({
          error: 'Invalid recurrence pattern',
          details: validation.errors
        }, { status: 400 });
      }

      updateData.recurrence = dehydrateRecurrence(mergedRecurrence);
    }

    // If recurrence changed but nextDeliveryAt wasn't explicitly provided, recalculate
    if (mergedRecurrence && !data.nextDeliveryAt) {
      const next = calculateNextDelivery(mergedRecurrence, new Date());
      if (next) {
        // Only set if user didn't explicitly pause/end
        if (!updateData.scheduleStatus) updateData.scheduleStatus = 'active';
        updateData.nextDeliveryAt = next;
      } else {
        if (!updateData.scheduleStatus) updateData.scheduleStatus = 'ended';
        updateData.nextDeliveryAt = null;
      }
    }

    // If user wants to activate but didn't provide nextDeliveryAt, compute using current or updated recurrence
    if (data.scheduleStatus === 'active' && !data.nextDeliveryAt && !updateData.nextDeliveryAt) {
      const rec = mergedRecurrence ?? hydrateRecurrence(order.recurrence);
      if (rec) {
        const next = calculateNextDelivery(rec, new Date());
        updateData.nextDeliveryAt = next ?? null;
        if (!next) updateData.scheduleStatus = 'ended';
      }
    }

    const updatedOrder = await prisma.order.update({ where: { id }, data: updateData, include: ORDER_INCLUDE });

    return NextResponse.json({
      success: true,
      data: serializeOrder(updatedOrder),
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
export const DELETE = requireAuth(async (request: NextRequest, context?: RecurringOrderRouteContext) => {
  try {
    const id = await getRouteId(context);
    if (!id) {
      return NextResponse.json({ error: 'Recurring order id is required' }, { status: 400 });
    }

    const user = (request as NextRequest & { user: AuthUser }).user;

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.mongoId || user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For users, just end the recurring schedule instead of deleting
    if (user.role !== 'admin') {
      const updated = await prisma.order.update({
        where: { id },
        data: { scheduleStatus: 'ended', nextDeliveryAt: null },
        include: ORDER_INCLUDE,
      });

      return NextResponse.json({
        success: true,
        data: serializeOrder(updated),
        message: 'Recurring order schedule ended successfully',
      });
    }

    // Admin can actually delete the order.
    // Restore stock for items if the order still holds reservations. Cancelled/refunded
    // orders already released their stock, so skip them to avoid double-restore.
    const shouldRestoreStock = !['delivered', 'shipped', 'cancelled', 'refunded'].includes(order.status);

    await prisma.$transaction(async (tx) => {
      if (shouldRestoreStock) {
        for (const item of order.items) {
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stockQty: { increment: item.qty || 0 } },
          });
        }
      }
      await tx.order.delete({ where: { id } });
    });

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
export const PATCH = requireAuth(async (request: NextRequest, context?: RecurringOrderRouteContext) => {
  try {
    const id = await getRouteId(context);
    if (!id) {
      return NextResponse.json({ error: 'Recurring order id is required' }, { status: 400 });
    }

    const body = await request.json();
    const user = (request as NextRequest & { user: AuthUser }).user;

    if (!body.action || !['pause', 'resume', 'end'].includes(body.action)) {
      return NextResponse.json({
        error: 'Invalid action. Must be pause, resume, or end'
      }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Check if it's actually a recurring order
    if (!order.isRecurring) {
      return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });
    }

    // Check ownership or admin access
    if (String(order.customerId) !== String(user.mongoId || user.userId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let updateData: Prisma.OrderUpdateInput = {};
    let message = '';

    switch (body.action) {
      case 'pause':
        updateData = { scheduleStatus: 'paused' };
        message = 'Recurring order paused successfully';
        break;
      case 'resume': {
        const rec = hydrateRecurrence(order.recurrence);
        let next: Date | null = null;
        if (rec) {
          next = calculateNextDelivery(rec, new Date());
        }
        updateData = { scheduleStatus: next ? 'active' : 'ended', nextDeliveryAt: next };
        message = next ? 'Recurring order resumed successfully' : 'Cannot resume: no future delivery dates in recurrence. Please update start/end dates or schedule.';
        break;
      }
      case 'end':
        updateData = {
          scheduleStatus: 'ended',
          nextDeliveryAt: null,
        };
        message = 'Recurring order ended successfully';
        break;
    }

    const updatedOrder = await prisma.order.update({ where: { id }, data: updateData, include: ORDER_INCLUDE });

    return NextResponse.json({
      success: true,
      data: serializeOrder(updatedOrder),
      message,
    });
  } catch (error) {
    console.error('Error performing recurring order action:', error);
    return NextResponse.json({
      error: 'Failed to perform action on recurring order'
    }, { status: 500 });
  }
});
