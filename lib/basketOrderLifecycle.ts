import type { Prisma, SubscriptionDelivery } from '@prisma/client';
export class BasketLifecycleError extends Error { constructor(message: string, public status = 409) { super(message); } }
export function validateBasketOrderTransition(before: string, next: string) {
  if (['shipped','delivered'].includes(before) && next === 'cancelled') throw new BasketLifecycleError('A shipped basket cannot be cancelled.');
  if (before === 'delivered' && !['delivered','refunded'].includes(next)) throw new BasketLifecycleError('A delivered basket cannot return to fulfillment.');
}
/** Caller claims the order first; queue actions use the same lock order. */
export async function syncBasketDelivery(tx: Prisma.TransactionClient, delivery: SubscriptionDelivery | null | undefined, nextStatus: string, address?: Prisma.InputJsonValue) {
  if (!delivery) return;
  const target = nextStatus === 'delivered' ? 'delivered' : ['cancelled','refunded'].includes(nextStatus) ? 'cancelled' : ['confirmed','processing','shipped'].includes(nextStatus) ? 'confirmed' : delivery.status;
  if (delivery.status === 'delivered') return; // A financial refund does not undo a completed delivery.
  if (['cancelled','skipped'].includes(delivery.status)) {
    if (target !== 'cancelled') throw new BasketLifecycleError('This basket delivery is no longer active.');
    return;
  }
  if (target === delivery.status && !address) return;
  const changed = await tx.subscriptionDelivery.updateMany({ where: { id: delivery.id, version: delivery.version, status: delivery.status }, data: { status: target, version: { increment: 1 }, ...(target === 'delivered' ? { deliveredAt: new Date() } : {}), ...(address ? { deliveryAddress: address } : {}) } });
  if (changed.count !== 1) throw new BasketLifecycleError('This basket delivery changed. Refresh before saving.');
  if (target === 'delivered') await tx.subscription.update({ where: { id: delivery.subscriptionId }, data: { totalDeliveries: { increment: 1 } } });
}
