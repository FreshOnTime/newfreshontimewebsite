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
      orderBy: [{ nextDeliveryDate: 'asc' }, { id: 'asc' }],
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

    return prisma.$transaction(async (tx) => {
      const current = await tx.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: { include: { contents: true } } },
      });
      if (!current || !current.plan.isActive || current.status !== 'active' || current.nextDeliveryDate.getTime() !== dueDate.getTime()) return null;

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

  static async transitionDelivery(deliveryId: string, action: 'confirm' | 'deliver' | 'cancel', version?: number) {
    return prisma.$transaction(async tx => {
      const delivery = await tx.subscriptionDelivery.findUnique({ where: { id: deliveryId } });
      if (!delivery) throw new DeliveryTransitionError('Delivery not found', 404);
      if (action === 'deliver' && delivery.status === 'delivered') return delivery;
      if (version !== undefined && delivery.version !== version) throw new DeliveryTransitionError('This delivery changed. Refresh before saving.', 409);
      const allowed = action === 'confirm' ? ['pending'] : ['pending', 'confirmed'];
      if (!allowed.includes(delivery.status)) throw new DeliveryTransitionError(`Cannot ${action} a ${delivery.status} delivery`, 409);
      const status = action === 'confirm' ? 'confirmed' : action === 'deliver' ? 'delivered' : 'cancelled';
      const claimed = await tx.subscriptionDelivery.updateMany({ where: { id: delivery.id, status: delivery.status, version: delivery.version }, data: { status, version: { increment: 1 }, ...(action === 'deliver' ? { deliveredAt: new Date() } : {}) } });
      if (claimed.count !== 1) throw new DeliveryTransitionError('This delivery changed. Refresh before saving.', 409);
      if (action === 'deliver') await tx.subscription.update({ where: { id: delivery.subscriptionId }, data: { totalDeliveries: { increment: 1 } } });
      return tx.subscriptionDelivery.findUniqueOrThrow({ where: { id: delivery.id } });
    });
  }
  static markDelivered(deliveryId: string) { return this.transitionDelivery(deliveryId, 'deliver'); }
}
export class DeliveryTransitionError extends Error { constructor(message: string, public status: number) { super(message); } }
