import mongoose from 'mongoose';
import Order from '@/lib/models/EnhancedOrder';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import { sendOrderEmail } from '@/lib/services/mailService';
import User from '@/lib/models/User';

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

export class RecurringOrderService {
  /**
   * Calculate the next delivery date based on recurrence pattern
   */
  static calculateNextDelivery(
    pattern: RecurringOrderPattern, 
    currentDate: Date = new Date()
  ): Date | null {
    const { recurrence } = pattern;
    
    // If end date is passed, no more deliveries
    if (recurrence.endDate && currentDate > recurrence.endDate) {
      return null;
    }

    // If specific dates are selected, find the next one
    if (recurrence.selectedDates && recurrence.selectedDates.length > 0) {
      const futureSelectedDates = recurrence.selectedDates
        .filter(date => date > currentDate)
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (futureSelectedDates.length > 0) {
        return futureSelectedDates[0];
      }
      return null; // No more selected dates
    }

    // If days of week are specified
    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      const today = new Date(currentDate);
      const currentDayOfWeek = today.getDay();
      
      // Find next occurrence
      let daysToAdd = 1;
      for (let i = 0; i < 7; i++) {
        const checkDay = (currentDayOfWeek + daysToAdd) % 7;
        if (recurrence.daysOfWeek.includes(checkDay)) {
          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + daysToAdd);
          
          // Check if this date is excluded
          if (recurrence.excludeDates && 
              recurrence.excludeDates.some(excludeDate => 
                excludeDate.toDateString() === nextDate.toDateString())) {
            daysToAdd++;
            continue;
          }
          
          // Check if within date range
          if (recurrence.startDate && nextDate < recurrence.startDate) {
            daysToAdd++;
            continue;
          }
          
          if (recurrence.endDate && nextDate > recurrence.endDate) {
            return null;
          }
          
          return nextDate;
        }
        daysToAdd++;
      }
    }

    // If include dates are specified, find the next one
    if (recurrence.includeDates && recurrence.includeDates.length > 0) {
      const futureIncludeDates = recurrence.includeDates
        .filter(date => date > currentDate)
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (futureIncludeDates.length > 0) {
        return futureIncludeDates[0];
      }
    }

    return null;
  }

  /**
   * Create next order instance from recurring pattern
   */
  static async createNextOrderInstance(orderId: string): Promise<mongoose.Document | null> {
    try {
      const recurringOrder = await Order.findById(orderId);
      if (!recurringOrder || !recurringOrder.isRecurring) {
        throw new Error('Order is not a recurring order');
      }

      if (recurringOrder.scheduleStatus !== 'active') {
        return null; // Don't create if paused or ended
      }

      // Calculate next delivery date
      const nextDelivery = this.calculateNextDelivery(
        recurringOrder as unknown as RecurringOrderPattern,
        recurringOrder.nextDeliveryAt || new Date()
      );

      if (!nextDelivery) {
        // No more deliveries, end the recurring schedule
        await Order.findByIdAndUpdate(orderId, {
          scheduleStatus: 'ended',
          nextDeliveryAt: null,
        });
        return null;
      }

      // Check product availability
      const availabilityChecks = await Promise.all(
        recurringOrder.items.map(async (item: unknown) => {
          const it = item as { productId: string; qty: number };
          const product = await EnhancedProduct.findById(it.productId);
          return {
            productId: it.productId,
            available: product ? product.stockQty >= it.qty : false,
            currentStock: product?.stockQty || 0,
            needed: it.qty,
          };
        })
      );

      const outOfStock = availabilityChecks.filter(check => !check.available);
      
      // Create new order instance
      const newOrderData = {
        ...recurringOrder.toObject(),
        _id: new mongoose.Types.ObjectId(),
        orderNumber: `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: outOfStock.length > 0 ? 'pending' : 'confirmed',
        estimatedDelivery: nextDelivery,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: outOfStock.length > 0 
          ? `Auto-generated from recurring order. Some items may be out of stock: ${outOfStock.map(i => i.productId).join(', ')}`
          : 'Auto-generated from recurring order',
      };

      // Remove version key
      if ('__v' in newOrderData) {
        delete (newOrderData as Record<string, unknown>).__v;
      }

      const newOrder = new Order(newOrderData);
      await newOrder.save();

      // Update stock quantities for available items
      if (outOfStock.length === 0) {
        await Promise.all(
          recurringOrder.items.map(async (item: unknown) => {
            const it = item as { productId: string; qty: number };
            await EnhancedProduct.findByIdAndUpdate(
              it.productId,
              { $inc: { stockQty: -it.qty } }
            );
          })
        );
      }

      // Update the original recurring order with next delivery date
      const followingDelivery = this.calculateNextDelivery(
        recurringOrder as unknown as RecurringOrderPattern,
        nextDelivery
      );

      await Order.findByIdAndUpdate(orderId, {
        nextDeliveryAt: followingDelivery,
        scheduleStatus: followingDelivery ? 'active' : 'ended',
      });

      // Attempt to send order confirmation email to customer (non-blocking)
      try {
        // Try to resolve customer email from recurringOrder or by loading the user
        let customerEmail: string | null = null;
        const ro = recurringOrder as unknown as { customerId?: string; customerEmail?: string };
        if (ro.customerEmail) customerEmail = ro.customerEmail as unknown as string;
        if (!customerEmail && ro.customerId) {
          const fullUser = await User.findById(ro.customerId).lean().catch(() => null) as (null | { email?: string; phoneNumber?: string });
          if (fullUser?.email) customerEmail = fullUser.email;
          else if (fullUser?.phoneNumber) customerEmail = fullUser.phoneNumber;
        }

        if (customerEmail) {
          const orderObj = newOrder.toObject ? newOrder.toObject() : newOrder;
          if (orderObj) {
            const mailOrder = {
              _id: orderObj._id ? String(orderObj._id) : undefined,
              total: typeof orderObj.total === 'number'
                ? orderObj.total
                : (typeof orderObj.subtotal === 'number' ? orderObj.subtotal : undefined),
            };
            sendOrderEmail(customerEmail, mailOrder).catch(e => console.error('sendOrderEmail error', e));
          }
        }
      } catch (e) {
        console.error('Recurring order email error:', e);
      }

      return newOrder;
    } catch (error) {
      console.error('Error creating next order instance:', error);
      throw error;
    }
  }

  /**
   * Process all pending recurring orders
   */
  static async processRecurringOrders(): Promise<{
    processed: number;
    created: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      created: 0,
      errors: [] as string[],
    };

    try {
      // Find all active recurring orders with due deliveries
      const dueOrders = await Order.find({
        isRecurring: true,
        scheduleStatus: 'active',
        nextDeliveryAt: { $lte: new Date() },
      });

      results.processed = dueOrders.length;

      for (const order of dueOrders) {
        try {
          const orderId = (order as any)._id;
          const newOrder = await this.createNextOrderInstance(String(orderId));
          if (newOrder) {
            results.created++;
          }
        } catch (error) {
          const idStr = (order as any)._id ? String((order as any)._id) : 'unknown';
          results.errors.push(`Order ${idStr}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Validate recurring order pattern
   */
  static validateRecurrencePattern(recurrence: RecurringOrderPattern['recurrence']): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Must have at least one recurrence method
    const hasDaysOfWeek = recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0;
    const hasIncludeDates = recurrence.includeDates && recurrence.includeDates.length > 0;
    const hasSelectedDates = recurrence.selectedDates && recurrence.selectedDates.length > 0;

    if (!hasDaysOfWeek && !hasIncludeDates && !hasSelectedDates) {
      errors.push('Must specify at least one recurrence pattern (daysOfWeek, includeDates, or selectedDates)');
    }

    // Validate date ranges
    if (recurrence.startDate && recurrence.endDate && recurrence.startDate >= recurrence.endDate) {
      errors.push('Start date must be before end date');
    }

    // Validate days of week
    if (recurrence.daysOfWeek) {
      const invalidDays = recurrence.daysOfWeek.filter(day => day < 0 || day > 6);
      if (invalidDays.length > 0) {
        errors.push('Days of week must be between 0 (Sunday) and 6 (Saturday)');
      }
    }

    // Validate selected dates are in the future
    if (recurrence.selectedDates) {
      const pastDates = recurrence.selectedDates.filter(date => date <= new Date());
      if (pastDates.length > 0) {
        errors.push('Selected dates must be in the future');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get recurring order statistics
   */
  static async getRecurringOrderStats(): Promise<{
    total: number;
    active: number;
    paused: number;
    ended: number;
    totalValue: number;
    avgOrderValue: number;
    nextDeliveries: Array<{
      orderId: string;
      orderNumber: string;
      customerId: string;
      nextDeliveryAt: Date;
      total: number;
    }>;
  }> {
    const [totalStats, nextDeliveries] = await Promise.all([
      Order.aggregate([
        { $match: { isRecurring: true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$scheduleStatus', 'active'] }, 1, 0] }
            },
            paused: {
              $sum: { $cond: [{ $eq: ['$scheduleStatus', 'paused'] }, 1, 0] }
            },
            ended: {
              $sum: { $cond: [{ $eq: ['$scheduleStatus', 'ended'] }, 1, 0] }
            },
            totalValue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
          }
        }
      ]),
      Order.find({
        isRecurring: true,
        scheduleStatus: 'active',
        nextDeliveryAt: { $gte: new Date() },
      })
      .select('_id orderNumber customerId nextDeliveryAt total')
      .sort({ nextDeliveryAt: 1 })
      .limit(10)
      .lean()
    ]);

    const stats = totalStats[0] || {
      total: 0,
      active: 0,
      paused: 0,
      ended: 0,
      totalValue: 0,
      avgOrderValue: 0,
    };

    return {
      ...stats,
      nextDeliveries: nextDeliveries.map(order => ({
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: order.customerId.toString(),
        nextDeliveryAt: order.nextDeliveryAt,
        total: order.total,
      })),
    };
  }
}
