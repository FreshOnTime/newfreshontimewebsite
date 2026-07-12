import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const NON_BILLABLE_STATUSES = ['cancelled', 'refunded'] as const;

/**
 * Resolve the Supplier this user represents: User.supplierId first, then match a
 * supplier by email/phone (persisting the link when found).
 */
async function resolveSupplierId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, supplierId: true, email: true, phoneNumber: true },
  });
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

      type ProductStats = {
        totalProducts: number;
        activeProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
      };

      // Aggregate in Postgres instead of transferring every product for this
      // supplier to the server and filtering it in JavaScript.
      const [productStatsRows, lowStockList, uploads, totalUploads, unreadMessages] = await Promise.all([
        prisma.$queryRaw<ProductStats[]>`
          SELECT
            COUNT(*)::int AS "totalProducts",
            COUNT(*) FILTER (WHERE NOT archived)::int AS "activeProducts",
            COUNT(*) FILTER (WHERE NOT archived AND "stockQty" <= "minStockLevel")::int AS "lowStockProducts",
            COUNT(*) FILTER (WHERE "stockQty" <= 0)::int AS "outOfStockProducts"
          FROM products
          WHERE "supplierId" = ${supplierId}
        `,
        prisma.$queryRaw<Array<{ id: string; name: string; sku: string; stockQty: number; minStockLevel: number }>>`
          SELECT id, name, sku, "stockQty", "minStockLevel"
          FROM products
          WHERE "supplierId" = ${supplierId}
            AND NOT archived
            AND "stockQty" <= "minStockLevel"
          ORDER BY "stockQty" ASC, name ASC
          LIMIT 8
        `,
        prisma.supplierUpload.findMany({
          where: { supplierId },
          select: { id: true, originalName: true, filename: true, preview: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.supplierUpload.count({ where: { supplierId } }),
        prisma.message.count({ where: { recipientId: userId, isRead: false } }),
      ]);

      const productStats = productStatsRows[0] ?? {
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
      };
      const lowStockItems = lowStockList.map((p) => ({
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
            totalProducts: productStats.totalProducts,
            activeProducts: productStats.activeProducts,
            lowStockProducts: productStats.lowStockProducts,
            outOfStockProducts: productStats.outOfStockProducts,
            totalUploads,
            unreadMessages,
            orders,
            unitsSold,
            revenue,
          },
          lowStockList: lowStockItems,
          recentUploads,
        },
      }, { headers: { 'Cache-Control': 'private, max-age=30' } });
    } catch (error) {
      console.error('Error building supplier dashboard:', error);
      return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
    }
  }
);
