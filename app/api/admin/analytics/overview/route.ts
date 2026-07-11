import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

// Ensure this route is always dynamic (no static caching) so dashboard reflects recent changes
export const dynamic = 'force-dynamic';

// GET /api/admin/analytics/overview
export const GET = requireAdminSimple(async () => {
  try {
    const now = new Date();
    const in14 = new Date();
    in14.setDate(in14.getDate() + 14);

    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      revenueResult,
      activeProductsForStock,
      pendingOrders,
      activeRecurring,
      recurringRevenueResult,
      upcomingRecurring,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.product.count({ where: { archived: false } }),
      prisma.order.count({ where: { isRecurring: false } }),
      prisma.order.aggregate({
        where: { isRecurring: false, OR: [{ status: 'delivered' }, { paymentStatus: 'paid' }] },
        _sum: { total: true },
      }),
      prisma.product.findMany({
        where: { archived: false },
        select: { stockQty: true, minStockLevel: true },
      }),
      prisma.order.count({ where: { isRecurring: false, status: 'pending' } }),
      prisma.order.count({ where: { isRecurring: true, scheduleStatus: 'active' } }),
      prisma.order.aggregate({
        where: { recurringSourceOrderId: { not: null }, OR: [{ status: 'delivered' }, { paymentStatus: 'paid' }] },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: {
          isRecurring: true,
          scheduleStatus: 'active',
          nextDeliveryAt: { gte: now, lte: in14 },
        },
        orderBy: { nextDeliveryAt: 'asc' },
        take: 10,
        select: { orderNumber: true, nextDeliveryAt: true, total: true, customerId: true },
      }),
    ]);

    const lowStockProducts = activeProductsForStock.filter((p) => p.stockQty <= p.minStockLevel).length;
    const totalRevenue = Number(revenueResult._sum.total || 0);
    const recurringRevenue = Number(recurringRevenueResult._sum.total || 0);

    const stats = {
      totalCustomers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      pendingOrders,
      activeRecurring,
      recurringRevenue,
      upcomingRecurring: upcomingRecurring.map((o) => ({ ...o, total: Number(o.total) })),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
});
