import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

export const GET = requireAdminSimple(async (request: NextRequest) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const where = status ? { status: status as 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'skipped' } : undefined;

  const deliveries = await prisma.subscriptionDelivery.findMany({
    where,
    include: {
      subscription: {
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
        },
      },
    },
    orderBy: { scheduledFor: 'asc' },
    take: 100,
  });

  return NextResponse.json({
    success: true,
    deliveries: deliveries.map((delivery) => ({ ...delivery, _id: delivery.id, price: Number(delivery.price) })),
  });
});
