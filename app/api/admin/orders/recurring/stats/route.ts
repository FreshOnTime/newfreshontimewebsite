import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

// GET - get recurring order statistics (admin only)
export const GET = requireAdminSimple(async () => {
  try {
    const now = new Date();
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);

    const [orders, upcomingDeliveries] = await Promise.all([
      prisma.order.findMany({
        where: { isRecurring: true },
        select: { scheduleStatus: true, total: true },
      }),
      prisma.order.count({
        where: {
          isRecurring: true,
          scheduleStatus: 'active',
          nextDeliveryAt: { gte: now, lte: in7 },
        },
      }),
    ]);

    const totalValue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const stats = {
      totalRecurringOrders: orders.length,
      activeOrders: orders.filter((o) => o.scheduleStatus === 'active').length,
      pausedOrders: orders.filter((o) => o.scheduleStatus === 'paused').length,
      endedOrders: orders.filter((o) => o.scheduleStatus === 'ended').length,
      totalValue,
      averageOrderValue: orders.length ? totalValue / orders.length : 0,
      upcomingDeliveries,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching recurring order stats:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring order statistics' }, { status: 500 });
  }
});
