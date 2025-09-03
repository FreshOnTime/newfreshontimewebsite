import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Order from '@/lib/models/EnhancedOrder';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    role: string;
  };
}

// Enhanced query schema for admin with more filtering options
const adminQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['active', 'paused', 'ended']).optional(),
  customerId: z.string().optional(),
  orderStatus: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  sortBy: z.enum(['createdAt', 'nextDeliveryAt', 'updatedAt', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// GET - fetch all recurring orders for admin with advanced filtering
export const GET = requireAdminSimple(async (request: NextRequest) => {
  try {
    await connectDB();
    const url = new URL(request.url);
    const query = adminQuerySchema.parse({
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
      status: url.searchParams.get('status') || undefined,
      customerId: url.searchParams.get('customerId') || undefined,
      orderStatus: url.searchParams.get('orderStatus') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
      search: url.searchParams.get('search') || undefined,
      dateFrom: url.searchParams.get('dateFrom') || undefined,
      dateTo: url.searchParams.get('dateTo') || undefined,
    });

    const { page, limit, status, customerId, orderStatus, sortBy, sortOrder, search, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    // Build filter for recurring orders
    const filter: Record<string, unknown> = {
      isRecurring: true,
    };

    if (status) {
      filter.scheduleStatus = status;
    }

    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      filter.customerId = customerId;
    }

    if (orderStatus) {
      filter.status = orderStatus;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);
      filter.createdAt = dateFilter;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Order.countDocuments(filter);

    // Get orders with pagination and sorting
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(filter)
      .populate({ 
        path: 'items.productId', 
        model: 'EnhancedProduct', 
        select: 'name price images stockQty sku' 
      })
      .populate({
        path: 'customerId',
        model: 'Customer',
        select: 'name email phone',
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    // Calculate analytics
    const analytics = await Order.aggregate([
      { $match: { isRecurring: true } },
      {
        $group: {
          _id: null,
          totalRecurringOrders: { $sum: 1 },
          activeOrders: {
            $sum: { $cond: [{ $eq: ['$scheduleStatus', 'active'] }, 1, 0] }
          },
          pausedOrders: {
            $sum: { $cond: [{ $eq: ['$scheduleStatus', 'paused'] }, 1, 0] }
          },
          endedOrders: {
            $sum: { $cond: [{ $eq: ['$scheduleStatus', 'ended'] }, 1, 0] }
          },
          totalValue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        analytics: analytics[0] || {
          totalRecurringOrders: 0,
          activeOrders: 0,
          pausedOrders: 0,
          endedOrders: 0,
          totalValue: 0,
          averageOrderValue: 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error fetching recurring orders (admin):', error);
    return NextResponse.json({ 
      error: 'Failed to fetch recurring orders' 
    }, { status: 500 });
  }
});

// POST - admin bulk actions on recurring orders
export const POST = requireAdminSimple(async (request: NextRequest) => {
  try {
    await connectDB();
    const body = await request.json();

    const bulkActionSchema = z.object({
      action: z.enum(['pause', 'resume', 'end', 'delete']),
      orderIds: z.array(z.string()).min(1),
    });

    const { action, orderIds } = bulkActionSchema.parse(body);

    // Validate all order IDs
    const invalidIds = orderIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid order IDs', 
        invalidIds 
      }, { status: 400 });
    }

    // Find all orders
    const orders = await Order.find({
      _id: { $in: orderIds },
      isRecurring: true,
    });

    if (orders.length !== orderIds.length) {
      return NextResponse.json({ 
        error: 'Some orders were not found or are not recurring orders' 
      }, { status: 404 });
    }

    let updateResult;
    let deletedCount = 0;

    switch (action) {
      case 'pause':
        updateResult = await Order.updateMany(
          { _id: { $in: orderIds } },
          { $set: { scheduleStatus: 'paused' } }
        );
        break;
      case 'resume':
        updateResult = await Order.updateMany(
          { _id: { $in: orderIds } },
          { $set: { scheduleStatus: 'active' } }
        );
        break;
      case 'end':
        updateResult = await Order.updateMany(
          { _id: { $in: orderIds } },
          { $set: { scheduleStatus: 'ended', nextDeliveryAt: null } }
        );
        break;
      case 'delete':
        // Actually delete the orders (admin only)
        const deleteResult = await Order.deleteMany({
          _id: { $in: orderIds }
        });
        deletedCount = deleteResult.deletedCount || 0;
        break;
    }

    // Log audit action
    await logAuditAction(
      (request as AuthenticatedRequest).user.userId,
      'bulk_update',
      'order',
      orderIds.join(','),
      { action, orderIds },
      { result: updateResult || { deletedCount } },
      request
    );

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      affected: action === 'delete' ? deletedCount : updateResult?.modifiedCount || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error performing bulk action on recurring orders:', error);
    return NextResponse.json({ 
      error: 'Failed to perform bulk action' 
    }, { status: 500 });
  }
});
