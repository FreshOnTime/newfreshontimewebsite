import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Statuses that should not count toward money the customer has actually committed.
const NON_BILLABLE_STATUSES = ['cancelled', 'refunded'] as const;
const OPEN_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'] as const;

/**
 * GET /api/dashboard/customer
 * Aggregated snapshot for the signed-in customer's dashboard:
 * headline stats, recent orders, and upcoming deliveries.
 */
export const GET = requireAuth(
  async (request: NextRequest & { user?: { userId: string; role: string; mongoId?: string } }) => {
    try {
      const authUser = request.user;
      const customerId = authUser?.mongoId || authUser?.userId;

      if (!customerId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const now = new Date();

      const [orders, subscriptions, wishlistCount, savedBags] = await Promise.all([
        prisma.order.findMany({
          where: { customerId },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
            nextDeliveryAt: true,
            scheduleStatus: true,
            _count: { select: { items: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.subscription.findMany({
          where: { userId: customerId },
          select: { status: true, nextDeliveryDate: true, plan: { select: { name: true } } },
        }),
        prisma.wishlistItem.count({ where: { userId: customerId } }),
        prisma.bag.count({ where: { userId: customerId, isActive: true } }),
      ]);

      const totalOrders = orders.length;
      const totalSpent = orders
        .filter((o) => !NON_BILLABLE_STATUSES.includes(o.status as (typeof NON_BILLABLE_STATUSES)[number]))
        .reduce((sum, o) => sum + Number(o.total), 0);
      const openOrders = orders.filter((o) =>
        OPEN_ORDER_STATUSES.includes(o.status as (typeof OPEN_ORDER_STATUSES)[number])
      ).length;

      const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;

      const recentOrders = orders.slice(0, 5).map((o) => ({
        _id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        total: Number(o.total),
        itemCount: o._count.items,
        createdAt: o.createdAt,
      }));

      type Upcoming = { type: 'order' | 'subscription'; label: string; date: string };
      const upcoming: Upcoming[] = [];

      for (const o of orders) {
        if (o.nextDeliveryAt && o.nextDeliveryAt >= now && o.scheduleStatus !== 'ended') {
          upcoming.push({ type: 'order', label: `Recurring order ${o.orderNumber}`, date: o.nextDeliveryAt.toISOString() });
        }
      }
      for (const s of subscriptions) {
        if (s.status === 'active' && s.nextDeliveryDate && s.nextDeliveryDate >= now) {
          upcoming.push({
            type: 'subscription',
            label: s.plan?.name ? `${s.plan.name} subscription` : 'Subscription delivery',
            date: s.nextDeliveryDate.toISOString(),
          });
        }
      }
      upcoming.sort((a, b) => +new Date(a.date) - +new Date(b.date));

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalOrders,
            openOrders,
            totalSpent,
            activeSubscriptions,
            wishlistCount,
            savedBags,
          },
          recentOrders,
          upcomingDeliveries: upcoming.slice(0, 5),
        },
      });
    } catch (error) {
      console.error('Error building customer dashboard:', error);
      return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
    }
  }
);
