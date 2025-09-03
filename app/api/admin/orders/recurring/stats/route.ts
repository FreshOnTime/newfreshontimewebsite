import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { RecurringOrderService } from '@/lib/services/recurringOrderService';
import { requireAdmin } from '@/lib/middleware/adminAuth';

// GET - get recurring order statistics (admin only)
export const GET = requireAdmin(async () => {
  try {
    await connectDB();

    const stats = await RecurringOrderService.getRecurringOrderStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching recurring order stats:', error);
    return NextResponse.json({
      error: 'Failed to fetch recurring order statistics',
    }, { status: 500 });
  }
});
