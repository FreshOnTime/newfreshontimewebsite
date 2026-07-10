import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const NON_BILLABLE_STATUSES = ['cancelled', 'refunded'] as const;

/**
 * Resolve the Supplier this user represents: User.supplierId first, then match a
 * supplier by email/phone (persisting the link when found).
 */
async function resolveSupplierId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  if (user.supplierId) return user.supplierId;

  let found = user.email ? await prisma.supplier.findUnique({ where: { email: user.email } }) : null;
  if (!found && user.phoneNumber) found = await prisma.supplier.findFirst({ where: { phone: user.phoneNumber } });

  if (found) {
    try {
      await prisma.user.update({ where: { id: user.id }, data: { supplierId: found.id } });
    } catch {
      /* best-effort link */
    }
    return found.id;
  }
  return null;
}

/**
 * GET /api/dashboard/supplier
 * Aggregated snapshot for the signed-in supplier: catalog health, demand for
 * their products, upload history, and unread messages.
 */
export const GET = requireAuth(
  async (request: NextRequest & { user?: { userId: string; role: string; mongoId?: string } }) => {
    try {
      const authUser = request.user;
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (authUser.role !== 'supplier' && authUser.role !== 'admin') {
        return NextResponse.json({ error: 'Supplier access required' }, { status: 403 });
      }

      const userId = authUser.mongoId || authUser.userId;
      const supplierId = await resolveSupplierId(userId);

      if (!supplierId) {
        return NextResponse.json({
          success: true,
          data: {
            linked: false,
            stats: {
              totalProducts: 0,
              activeProducts: 0,
              lowStockProducts: 0,
              outOfStockProducts: 0,
              totalUploads: 0,
              unreadMessages: 0,
              orders: 0,
              unitsSold: 0,
              revenue: 0,
            },
            lowStockList: [],
            recentUploads: [],
          },
        });
      }

      const [products, uploads, totalUploads, unreadMessages] = await Promise.all([
        prisma.product.findMany({
          where: { supplierId },
          select: { id: true, name: true, sku: true, stockQty: true, minStockLevel: true, archived: true },
          orderBy: { stockQty: 'asc' },
        }),
        prisma.supplierUpload.findMany({
          where: { supplierId },
          select: { id: true, originalName: true, filename: true, preview: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.supplierUpload.count({ where: { supplierId } }),
        prisma.message.count({ where: { recipientId: userId, isRead: false } }),
      ]);

      const totalProducts = products.length;
      const activeProducts = products.filter((p) => !p.archived).length;
      const lowStock = products.filter((p) => !p.archived && p.stockQty <= p.minStockLevel);
      const lowStockProducts = lowStock.length;
      const outOfStockProducts = products.filter((p) => p.stockQty <= 0).length;
      const lowStockList = lowStock.slice(0, 8).map((p) => ({
        _id: p.id,
        name: p.name,
        sku: p.sku,
        stockQty: p.stockQty,
        minStockLevel: p.minStockLevel,
      }));

      // Demand for this supplier's products (matching line items only).
      // Filter through the Product relation instead of constructing an
      // ever-growing `IN (...)` list from the supplier's entire catalog.
      const [orders, lineAgg] = await Promise.all([
        prisma.order.count({
          where: {
            status: { notIn: [...NON_BILLABLE_STATUSES] },
            items: { some: { product: { supplierId } } },
          },
        }),
        prisma.orderItem.aggregate({
          where: {
            product: { supplierId },
            order: { status: { notIn: [...NON_BILLABLE_STATUSES] } },
          },
          _sum: { qty: true, total: true },
        }),
      ]);
      const unitsSold = lineAgg._sum.qty || 0;
      const revenue = Number(lineAgg._sum.total || 0);

      const recentUploads = uploads.map((u) => ({
        _id: u.id,
        name: u.originalName || u.filename || 'Upload',
        rows: Array.isArray(u.preview) ? (u.preview as unknown[]).length : 0,
        createdAt: u.createdAt,
      }));

      return NextResponse.json({
        success: true,
        data: {
          linked: true,
          stats: {
            totalProducts,
            activeProducts,
            lowStockProducts,
            outOfStockProducts,
            totalUploads,
            unreadMessages,
            orders,
            unitsSold,
            revenue,
          },
          lowStockList,
          recentUploads,
        },
      });
    } catch (error) {
      console.error('Error building supplier dashboard:', error);
      return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
    }
  }
);
