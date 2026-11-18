import type { Prisma } from '@prisma/client';
import { sendEmail } from '@/lib/services/mailService';

export type SupplyLine = { productId: string; sku: string; name: string; qty: number; supplierId?: string | null };
export const OPEN_ORDER = { notIn: ['cancelled', 'refunded', 'delivered', 'shipped'] as ('cancelled' | 'refunded' | 'delivered' | 'shipped')[] };

export function groupSupplierItems(items: SupplyLine[]) {
  const groups = new Map<string, Omit<SupplyLine, 'supplierId'>[]>();
  for (const { supplierId, ...item } of items) {
    if (!supplierId) continue;
    const group = groups.get(supplierId) || [];
    group.push({ productId: item.productId, sku: item.sku, name: item.name, qty: item.qty });
    groups.set(supplierId, group);
  }
  return groups;
}

/** Called only for actual orders, inside the stock reservation transaction. */
export async function createSupplierOrders(tx: Prisma.TransactionClient, order: { id: string; orderNumber: string }, items: SupplyLine[]) {
  const groups = groupSupplierItems(items);
  if (!groups.size) return;
  const suppliers = await tx.supplier.findMany({ where: { id: { in: [...groups.keys()] } }, select: {
    id: true, status: true, applicationStatus: true,
    products: { where: { role: 'supplier', isBanned: false }, select: { id: true, email: true, isEmailVerified: true } },
  } });
  for (const supplier of suppliers) {
    const lines = groups.get(supplier.id)!;
    const created = await tx.supplierOrder.createMany({ data: [{ orderId: order.id, supplierId: supplier.id, items: lines }], skipDuplicates: true });
    if (!created.count || supplier.status !== 'active' || supplier.applicationStatus !== 'approved') continue;
    const title = `New supply request: ${order.orderNumber}`;
    const message = 'Review your requested products and confirm availability in the partner workspace.';
    for (const user of supplier.products) {
      await tx.notification.create({ data: { targetUserId: user.id, type: 'info', title, message, link: '/dashboard?section=orders' } });
      // Never include customer details or other suppliers' items in an email.
      if (user.email && user.isEmailVerified && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) && user.email.length <= 254) {
        await sendEmail(user.email, title, '<p>A new supply request is available. Sign in to FreshPick Partners to review quantities and confirm availability.</p>', message, { tx, dedupeKey: `supplier-order:${order.id}:${user.id}` });
      }
    }
  }
}

export function supplierTransition(status: string, action: string) {
  if (status === 'pending' && action === 'accept') return 'accepted' as const;
  if ((status === 'pending' || status === 'accepted') && action === 'unavailable') return 'unavailable' as const;
  if (status === 'accepted' && action === 'ready') return 'ready' as const;
  return null;
}
