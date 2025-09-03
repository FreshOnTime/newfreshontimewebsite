import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { RecurringOrderService } from '@/lib/services/recurringOrderService';

// GET - process recurring orders (for cron job)
export const GET = async (request: NextRequest) => {
  try {
    // Simple security check - only allow from localhost or with proper auth token
    const authHeader = request.headers.get('authorization');
    const cronToken = process.env.CRON_SECRET_TOKEN;
    
    if (!cronToken || authHeader !== `Bearer ${cronToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const results = await RecurringOrderService.processRecurringOrders();

    return NextResponse.json({
      success: true,
      data: results,
      message: `Processed ${results.processed} recurring orders, created ${results.created} new orders`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing recurring orders cron:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process recurring orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
};

// POST - manual trigger for processing (admin only)
export const POST = async (request: NextRequest) => {
  try {
    // This would require admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    await connectDB();

    const results = await RecurringOrderService.processRecurringOrders();

    return NextResponse.json({
      success: true,
      data: results,
      message: `Manually processed ${results.processed} recurring orders, created ${results.created} new orders`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error manually processing recurring orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process recurring orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
};
