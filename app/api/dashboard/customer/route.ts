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

      // Keep each query bounded. The previous implementation loaded every order
      // for a customer just to calculate counts and sums, which gets slower as
      // an account ages.
      const [
        totalOrders,
        totalSpentAggregate,
        openOrders,
        activeSubscriptions,
        wishlistCount,
        savedBags,
        recentOrders,
        upcomingSubscriptions,
        upcomingOrders,
      ] = await Promise.all([
        prisma.order.count({ where: { customerId, isRecurring: false } }),
        prisma.order.aggregate({
          where: { customerId, isRecurring: false, status: { notIn: [...NON_BILLABLE_STATUSES] } },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: { customerId, isRecurring: false, status: { in: [...OPEN_ORDER_STATUSES] } },
        }),
        prisma.subscription.count({ where: { userId: customerId, status: 'active' } }),
        prisma.wishlistItem.count({ where: { userId: customerId } }),
        prisma.bag.count({ where: { userId: customerId, isActive: true } }),
        prisma.order.findMany({
          where: { customerId, isRecurring: false },
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
          take: 5,
        }),
        prisma.subscription.findMany({
          where: {
            userId: customerId,
            status: 'active',
            nextDeliveryDate: { gte: now },
          },
          select: { status: true, nextDeliveryDate: true, plan: { select: { name: true } } },
          orderBy: { nextDeliveryDate: 'asc' },
          take: 5,
        }),
        prisma.order.findMany({
          where: {
            customerId,
            isRecurring: true,
            nextDeliveryAt: { gte: now },
            OR: [{ scheduleStatus: { not: 'ended' } }, { scheduleStatus: null }],
          },
          select: { orderNumber: true, nextDeliveryAt: true },
          orderBy: { nextDeliveryAt: 'asc' },
          take: 5,
        }),
      ]);

      const totalSpent = Number(totalSpentAggregate._sum.total ?? 0);

      const recentOrderData = recentOrders.map((o) => ({
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

      for (const o of upcomingOrders) {
        if (o.nextDeliveryAt) {
          upcoming.push({ type: 'order', label: `Recurring order ${o.orderNumber}`, date: o.nextDeliveryAt.toISOString() });
        }
      }
      for (const s of upcomingSubscriptions) {
        if (s.nextDeliveryDate) {
          upcoming.push({
            type: 'subscription',
            label: s.plan?.name ? `${s.plan.name} subscription` : 'Subscription delivery',
            date: s.nextDeliveryDate.toISOString(),
          });
        }
      }
      upcoming.sort((a, b) => +new Date(a.date) - +new Date(b.date));

      return NextResponse.json(
        {
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
            recentOrders: recentOrderData,
            upcomingDeliveries: upcoming.slice(0, 5),
          },
        },
        // This is personalized data, so it must never enter a shared cache.
        // A short browser-only cache avoids repeating the same aggregate work
        // when the user leaves and returns to their dashboard.
        { headers: { 'Cache-Control': 'private, max-age=30' } }
      );
    } catch (error) {
      console.error('Error building customer dashboard:', error);
      return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
    }
  }
);
