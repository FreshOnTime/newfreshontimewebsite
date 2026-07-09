import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { sendOrderEmail } from '@/lib/services/mailService';

export interface RecurringOrderPattern {
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    qty: number;
    price: number;
    total: number;
  }>;
  recurrence: {
    startDate?: Date;
    endDate?: Date;
    daysOfWeek?: number[];
    includeDates?: Date[];
    excludeDates?: Date[];
    selectedDates?: Date[];
    rruleString?: string;
    notes?: string;
  };
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

function hydrateRecurrence(rec: Prisma.JsonValue): RecurringOrderPattern['recurrence'] {
  if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return {};
  const r = rec as Record<string, unknown>;
  return {
    startDate: r.startDate ? new Date(String(r.startDate)) : undefined,
    endDate: r.endDate ? new Date(String(r.endDate)) : undefined,
    daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek.filter((d): d is number => typeof d === 'number') : undefined,
    includeDates: Array.isArray(r.includeDates) ? r.includeDates.map((d) => new Date(String(d))) : undefined,
    excludeDates: Array.isArray(r.excludeDates) ? r.excludeDates.map((d) => new Date(String(d))) : undefined,
    selectedDates: Array.isArray(r.selectedDates) ? r.selectedDates.map((d) => new Date(String(d))) : undefined,
    notes: typeof r.notes === 'string' ? r.notes : undefined,
  };
}

function recurrenceToJson(rec: RecurringOrderPattern['recurrence']): Prisma.InputJsonValue {
  return {
    ...(rec.startDate ? { startDate: rec.startDate.toISOString() } : {}),
    ...(rec.endDate ? { endDate: rec.endDate.toISOString() } : {}),
    ...(rec.daysOfWeek ? { daysOfWeek: rec.daysOfWeek } : {}),
    ...(rec.includeDates ? { includeDates: rec.includeDates.map((d) => d.toISOString()) } : {}),
    ...(rec.excludeDates ? { excludeDates: rec.excludeDates.map((d) => d.toISOString()) } : {}),
    ...(rec.selectedDates ? { selectedDates: rec.selectedDates.map((d) => d.toISOString()) } : {}),
    ...(rec.notes ? { notes: rec.notes } : {}),
  };
}

export class RecurringOrderService {
  static calculateNextDelivery(pattern: RecurringOrderPattern, currentDate: Date = new Date()): Date | null {
    const { recurrence } = pattern;
    if (recurrence.endDate && currentDate > recurrence.endDate) return null;

    if (recurrence.rruleString) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { rrulestr } = require('rrule');
        const next = rrulestr(recurrence.rruleString).after(currentDate);
        if (next && (!recurrence.endDate || next <= recurrence.endDate)) return next;
      } catch (e) {
        console.error('Error parsing RRULE:', e);
      }
    }

    const excluded = new Set((recurrence.excludeDates || []).map((d) => d.toDateString()));
    const explicit = [...(recurrence.selectedDates || []), ...(recurrence.includeDates || [])]
      .filter((d) => d > currentDate && !excluded.has(d.toDateString()) && (!recurrence.endDate || d <= recurrence.endDate))
      .sort((a, b) => +a - +b);
    if (explicit.length) return explicit[0];

    const days = recurrence.daysOfWeek || [];
    if (!days.length) return null;
    for (let i = 1; i <= 366; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + i);
      if (recurrence.endDate && nextDate > recurrence.endDate) return null;
      if (days.includes(nextDate.getDay()) && !excluded.has(nextDate.toDateString())) return nextDate;
    }
    return null;
  }

  static async createNextOrderInstance(orderId: string) {
    const recurringOrder = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, customer: true } });
    if (!recurringOrder || !recurringOrder.isRecurring) throw new Error('Order is not a recurring order');
    if (recurringOrder.scheduleStatus !== 'active') return null;

    const pattern = {
      ...recurringOrder,
      recurrence: hydrateRecurrence(recurringOrder.recurrence),
      subtotal: Number(recurringOrder.subtotal),
      tax: Number(recurringOrder.tax),
      shipping: Number(recurringOrder.shipping),
      discount: Number(recurringOrder.discount),
      total: Number(recurringOrder.total),
    } as unknown as RecurringOrderPattern;

    const nextDelivery = this.calculateNextDelivery(pattern, recurringOrder.nextDeliveryAt || new Date());
    if (!nextDelivery) {
      await prisma.order.update({ where: { id: orderId }, data: { scheduleStatus: 'ended', nextDeliveryAt: null } });
      return null;
    }

    const productIds = recurringOrder.items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const outOfStock = recurringOrder.items.filter((it) => (productMap.get(it.productId)?.stockQty || 0) < it.qty);

    const followingDelivery = this.calculateNextDelivery(pattern, nextDelivery);
    const created = await prisma.$transaction(async (tx) => {
      if (!outOfStock.length) {
        for (const item of recurringOrder.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.qty } } });
        }
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber: `AUTO-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          customerId: recurringOrder.customerId,
          bagId: recurringOrder.bagId,
          bagName: recurringOrder.bagName,
          subtotal: recurringOrder.subtotal,
          tax: recurringOrder.tax,
          shipping: recurringOrder.shipping,
          discount: recurringOrder.discount,
          total: recurringOrder.total,
          status: outOfStock.length ? 'pending' : 'confirmed',
          paymentMethod: recurringOrder.paymentMethod,
          paymentStatus: recurringOrder.paymentStatus,
          shippingAddress: recurringOrder.shippingAddress as Prisma.InputJsonValue,
          billingAddress: recurringOrder.billingAddress as Prisma.InputJsonValue,
          notes: outOfStock.length
            ? `Auto-generated from recurring order. Some items may be out of stock: ${outOfStock.map((i) => i.productId).join(', ')}`
            : 'Auto-generated from recurring order',
          estimatedDelivery: nextDelivery,
          isRecurring: false,
          items: {
            create: recurringOrder.items.map((it) => ({
              productId: it.productId,
              sku: it.sku,
              name: it.name,
              qty: it.qty,
              price: it.price,
              total: it.total,
            })),
          },
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { nextDeliveryAt: followingDelivery, scheduleStatus: followingDelivery ? 'active' : 'ended' },
      });

      return newOrder;
    });

    const customerEmail = recurringOrder.customer.email || recurringOrder.customer.phoneNumber;
    if (customerEmail) {
      sendOrderEmail(customerEmail, { _id: created.id, total: Number(created.total) }).catch((e) => console.error('sendOrderEmail error', e));
    }

    return created;
  }

  static async processRecurringOrders() {
    const results = { processed: 0, created: 0, errors: [] as string[] };
    const dueOrders = await prisma.order.findMany({
      where: { isRecurring: true, scheduleStatus: 'active', nextDeliveryAt: { lte: new Date() } },
      select: { id: true },
    });
    results.processed = dueOrders.length;

    for (const order of dueOrders) {
      try {
        const created = await this.createNextOrderInstance(order.id);
        if (created) results.created++;
      } catch (error) {
        results.errors.push(`Order ${order.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    return results;
  }

  static validateRecurrencePattern(recurrence: RecurringOrderPattern['recurrence']) {
    const errors: string[] = [];
    if (!recurrence.daysOfWeek?.length && !recurrence.includeDates?.length && !recurrence.selectedDates?.length) {
      errors.push('Must specify at least one recurrence pattern (daysOfWeek, includeDates, or selectedDates)');
    }
    if (recurrence.startDate && recurrence.endDate && recurrence.startDate >= recurrence.endDate) {
      errors.push('Start date must be before end date');
    }
    if (recurrence.daysOfWeek?.some((day) => day < 0 || day > 6)) {
      errors.push('Days of week must be between 0 (Sunday) and 6 (Saturday)');
    }
    return { valid: errors.length === 0, errors };
  }

  static async getRecurringOrderStats() {
    const [orders, nextDeliveries] = await Promise.all([
      prisma.order.findMany({ where: { isRecurring: true }, select: { scheduleStatus: true, total: true } }),
      prisma.order.findMany({
        where: { isRecurring: true, scheduleStatus: 'active', nextDeliveryAt: { gte: new Date() } },
        select: { id: true, orderNumber: true, customerId: true, nextDeliveryAt: true, total: true },
        orderBy: { nextDeliveryAt: 'asc' },
        take: 10,
      }),
    ]);
    const totalValue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    return {
      total: orders.length,
      active: orders.filter((o) => o.scheduleStatus === 'active').length,
      paused: orders.filter((o) => o.scheduleStatus === 'paused').length,
      ended: orders.filter((o) => o.scheduleStatus === 'ended').length,
      totalValue,
      avgOrderValue: orders.length ? totalValue / orders.length : 0,
      nextDeliveries: nextDeliveries.map((order) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        nextDeliveryAt: order.nextDeliveryAt,
        total: Number(order.total),
      })),
    };
  }
}
