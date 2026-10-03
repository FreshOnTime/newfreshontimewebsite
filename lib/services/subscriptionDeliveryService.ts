import { randomUUID } from 'crypto';
import { allocateBasketPrice } from '@/lib/basketPricing';
import { reserveCheckoutStock, CheckoutError } from '@/lib/checkoutService';
import { productUnitPrice } from '@/lib/commercePricing';
import { orderAddressSchema } from '@/lib/orderAddress';
import { assertDeliveryArea } from '@/lib/deliveryPolicy';
import { sendOrderEmail } from '@/lib/services/mailService';
import { syncBasketDelivery, validateBasketOrderTransition } from '@/lib/basketOrderLifecycle';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { advanceByFrequency, nextWeekday } from '@/lib/subscriptionUtils';

export class SubscriptionDeliveryService {
  /**
   * Create one pending delivery for each due subscription, then advance the
   * schedule. The conditional update claims the exact due timestamp so two
   * overlapping scheduled-function invocations cannot create duplicates.
   */
  static async processDueSubscriptions(deadline = Date.now()+20_000) {
    const expiredPauses = await prisma.subscription.findMany({ where: { status: 'paused', pausedUntil: { lte: new Date() }, plan: { isActive: true } }, take: 50 });
    for (const paused of expiredPauses) {
      if (Date.now()>=deadline) break;
      await prisma.subscription.updateMany({ where: { id: paused.id, status: 'paused', pausedUntil: paused.pausedUntil, updatedAt: paused.updatedAt }, data: { status: 'active', pausedUntil: null, nextDeliveryDate: nextWeekday(new Date(), paused.deliverySlotDay) } });
    }
    const dueSubscriptions = await prisma.subscription.findMany({
      where: { status: 'active', nextDeliveryDate: { lte: new Date() }, plan: { isActive: true } },
      orderBy: [{ fulfillmentErrorAt: { sort: 'asc', nulls: 'first' } }, { nextDeliveryDate: 'asc' }, { id: 'asc' }],
      select: { id: true },
      take: 50,
    });

    const result = { processed: 0, created: 0, errors: [] as string[] };
    for (const subscription of dueSubscriptions) {
      if (Date.now() >= deadline) break;
      result.processed++;
      try {
        const created = await this.createPendingDelivery(subscription.id);
        if (created) result.created++;
      } catch (error) {
        result.errors.push(
          `Subscription ${subscription.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
    return result;
  }

  static async createPendingDelivery(subscriptionId: string) {
    const now = new Date();
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { id: true, status: true, nextDeliveryDate: true },
    });
    if (!subscription || subscription.status !== 'active' || subscription.nextDeliveryDate > now) return null;
    const dueDate = subscription.nextDeliveryDate;

    try { return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM subscriptions WHERE id=${subscriptionId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM subscription_plans WHERE id=(SELECT "planId" FROM subscriptions WHERE id=${subscriptionId}) FOR SHARE`;
      const current = await tx.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: { include: { contents: true } }, user: true },
      });
      if (!current || !current.plan.isActive || current.status !== 'active' || current.nextDeliveryDate.getTime() !== dueDate.getTime()) return null;

      let nextDeliveryDate = advanceByFrequency(
        dueDate,
        current.deliverySlotDay,
        current.plan.frequency
      );
      // Recover one overdue basket, never bill every missed week after a shortage.
      if (current.plan.inventoryManaged) while (nextDeliveryDate <= now) nextDeliveryDate = advanceByFrequency(nextDeliveryDate, current.deliverySlotDay, current.plan.frequency);
      const claimed = await tx.subscription.updateMany({
        where: { id: current.id, status: 'active', nextDeliveryDate: dueDate, updatedAt: current.updatedAt },
        data: { nextDeliveryDate, fulfillmentError: null, fulfillmentErrorAt: null },
      });
      if (claimed.count !== 1) return null;

      let orderId: string | undefined;
      if (current.plan.inventoryManaged) {
        if (current.user.isBanned) throw new BasketFulfillmentError('Customer account is unavailable.');
        if (current.excludeItems.length || current.preferences?.trim()) throw new BasketFulfillmentError('This basket has custom requests. Review the plan and customer preferences before fulfillment.');
        const address = orderAddressSchema.safeParse(current.deliveryAddress);
        if (!address.success) throw new BasketFulfillmentError('The delivery address is incomplete. Update it before retrying.');
        assertDeliveryArea(address.data);
        const quantities = new Map<string, number>();
        if (!current.plan.contents.length) throw new BasketFulfillmentError('Map basket contents to catalogue products first.');
        for (const item of current.plan.contents) {
          if (!item.productId || item.units < 1) throw new BasketFulfillmentError('Every basket item needs a product and stock quantity.');
          quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.units);
        }
        const products = await tx.product.findMany({ where: { id: { in: [...quantities.keys()] }, archived: false } });
        const reserved = [...quantities].sort(([a],[b]) => a.localeCompare(b)).map(([id, qty]) => {
          const product = products.find(product => product.id === id);
          if (!product) throw new BasketFulfillmentError('A mapped product is unavailable. Update the basket contents.');
          if (qty > 10000 || product.stockQty < qty) throw new BasketFulfillmentError(`Insufficient stock for ${product.name}. Replenish stock or update the plan.`);
          const price = productUnitPrice(product);
          return { productId: id, sku: product.sku, name: product.name, qty, price, total: price * qty, basePrice: product.price, discountPercentage: product.discountPercentage };
        });
        await reserveCheckoutStock(tx, reserved);
        const price = Number(current.plan.price);
        const order = await tx.order.create({ data: {
          orderNumber: `BASKET-${randomUUID()}`, customerId: current.userId,
          subtotal: price, total: price, shipping: 0, tax: 0, discount: 0,
          paymentMethod: 'cash', paymentStatus: 'pending', status: 'pending',
          shippingAddress: address.data, estimatedDelivery: dueDate,
          notes: `Basket: ${current.plan.name}. Delivery included. Basket price allocated across contents; individual product prices may differ.`,
          items: { create: allocateBasketPrice(price, reserved) },
        } });
        orderId = order.id;
        if (current.user.email) await sendOrderEmail(current.user.email, { _id: order.id, total: price }, tx);
      }
      return tx.subscriptionDelivery.create({
        data: {
          subscriptionId: current.id,
          orderId,
          scheduledFor: dueDate,
          planName: current.plan.name,
          price: current.plan.price,
          contentsSnapshot: JSON.parse(JSON.stringify(current.plan.contents)) as Prisma.InputJsonValue,
          deliveryAddress: current.deliveryAddress as Prisma.InputJsonValue,
          deliverySlotDay: current.deliverySlotDay,
          deliverySlotTime: current.deliverySlotTime,
        },
      });
    }); } catch (error) {
      const message = error instanceof Error ? error.message : 'Basket fulfillment failed';
      await prisma.subscription.updateMany({ where: { id: subscriptionId, status: 'active', nextDeliveryDate: dueDate }, data: { fulfillmentError: message.slice(0, 1000), fulfillmentErrorAt: new Date() } });
      if (error instanceof CheckoutError) throw new BasketFulfillmentError(message);
      throw error;
    }
  }

  static async transitionDelivery(deliveryId: string, action: 'confirm' | 'deliver' | 'cancel', version?: number) {
    return prisma.$transaction(async tx => {
      const delivery = await tx.subscriptionDelivery.findUnique({ where: { id: deliveryId }, include: { order: { include: { items: true } } } });
      if (!delivery) throw new DeliveryTransitionError('Delivery not found', 404);
      if (action === 'deliver' && delivery.status === 'delivered') return delivery;
      if (version !== undefined && delivery.version !== version) throw new DeliveryTransitionError('This delivery changed. Refresh before saving.', 409);
      const allowed = action === 'confirm' ? ['pending'] : ['pending', 'confirmed'];
      if (!allowed.includes(delivery.status)) throw new DeliveryTransitionError(`Cannot ${action} a ${delivery.status} delivery`, 409);
      const status = action === 'confirm' ? 'confirmed' : action === 'deliver' ? 'delivered' : 'cancelled';
      if (delivery.order) {
        const order = delivery.order;
        const nextStatus = action === 'confirm' && ['processing','shipped'].includes(order.status) ? order.status : status;
        validateBasketOrderTransition(order.status, nextStatus);
        if (['cancelled','refunded'].includes(order.status)) throw new DeliveryTransitionError('This basket order is no longer active.', 409);
        const changed = await tx.order.updateMany({ where: { id: order.id, status: order.status, updatedAt: order.updatedAt }, data: { status: nextStatus, ...(action === 'deliver' ? { actualDelivery: new Date() } : {}) } });
        if (changed.count !== 1) throw new DeliveryTransitionError('This order changed. Refresh before saving.', 409);
        await syncBasketDelivery(tx, delivery, nextStatus);
        if (action === 'cancel') for (const item of order.items) await tx.product.updateMany({ where: { id: item.productId }, data: { stockQty: { increment: item.qty } } });
        return tx.subscriptionDelivery.findUniqueOrThrow({ where: { id: delivery.id } });
      }
      const claimed = await tx.subscriptionDelivery.updateMany({ where: { id: delivery.id, status: delivery.status, version: delivery.version }, data: { status, version: { increment: 1 }, ...(action === 'deliver' ? { deliveredAt: new Date() } : {}) } });
      if (claimed.count !== 1) throw new DeliveryTransitionError('This delivery changed. Refresh before saving.', 409);
      if (action === 'deliver') await tx.subscription.update({ where: { id: delivery.subscriptionId }, data: { totalDeliveries: { increment: 1 } } });
      return tx.subscriptionDelivery.findUniqueOrThrow({ where: { id: delivery.id } });
    });
  }
  static markDelivered(deliveryId: string) { return this.transitionDelivery(deliveryId, 'deliver'); }
}
export class DeliveryTransitionError extends Error { constructor(message: string, public status: number) { super(message); } }

export class BasketFulfillmentError extends Error { constructor(message: string, public status = 409) { super(message); } }
