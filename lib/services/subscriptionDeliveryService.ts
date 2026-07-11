import { Prisma, SubscriptionDeliveryStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { advanceByFrequency } from '@/lib/subscriptionUtils';

export class SubscriptionDeliveryService {
  /**
   * Create one pending delivery for each due subscription, then advance the
   * schedule. The conditional update claims the exact due timestamp so two
   * overlapping scheduled-function invocations cannot create duplicates.
   */
  static async processDueSubscriptions() {
    const dueSubscriptions = await prisma.subscription.findMany({
      where: { status: 'active', nextDeliveryDate: { lte: new Date() } },
      select: { id: true },
      take: 50,
    });

    const result = { processed: dueSubscriptions.length, created: 0, errors: [] as string[] };
    for (const subscription of dueSubscriptions) {
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

    return prisma.$transaction(async (tx) => {
      const current = await tx.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: { include: { contents: true } } },
      });
      if (!current || current.status !== 'active' || current.nextDeliveryDate.getTime() !== dueDate.getTime()) return null;

      const nextDeliveryDate = advanceByFrequency(
        dueDate,
        current.deliverySlotDay,
        current.plan.frequency
      );
      const claimed = await tx.subscription.updateMany({
        where: { id: current.id, status: 'active', nextDeliveryDate: dueDate },
        data: { nextDeliveryDate },
      });
      if (claimed.count !== 1) return null;

      return tx.subscriptionDelivery.create({
        data: {
          subscriptionId: current.id,
          scheduledFor: dueDate,
          planName: current.plan.name,
          price: current.plan.price,
          contentsSnapshot: JSON.parse(JSON.stringify(current.plan.contents)) as Prisma.InputJsonValue,
          deliveryAddress: current.deliveryAddress as Prisma.InputJsonValue,
          deliverySlotDay: current.deliverySlotDay,
          deliverySlotTime: current.deliverySlotTime,
        },
      });
    });
  }

  /** Mark a pending/confirmed delivery complete exactly once. */
  static async markDelivered(deliveryId: string) {
    return prisma.$transaction(async (tx) => {
      const delivery = await tx.subscriptionDelivery.findUnique({ where: { id: deliveryId } });
      if (!delivery) throw new Error('Delivery not found');
      if (delivery.status === SubscriptionDeliveryStatus.delivered) return delivery;
      if (
        delivery.status !== SubscriptionDeliveryStatus.pending &&
        delivery.status !== SubscriptionDeliveryStatus.confirmed
      ) {
        throw new Error(`Cannot deliver a ${delivery.status} delivery`);
      }

      const updated = await tx.subscriptionDelivery.update({
        where: { id: delivery.id },
        data: { status: SubscriptionDeliveryStatus.delivered, deliveredAt: new Date() },
      });
      await tx.subscription.update({
        where: { id: delivery.subscriptionId },
        data: { totalDeliveries: { increment: 1 } },
      });
      return updated;
    });
  }
}
