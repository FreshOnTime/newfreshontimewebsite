import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Order from '@/lib/models/EnhancedOrder';
import { requireAuth } from '@/lib/auth';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    role: string;
  };
}

// Validation schema for recurring order data
const recurringOrderSchema = z.object({
  isRecurring: z.boolean().default(true),
  recurrence: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    includeDates: z.array(z.string().datetime()).optional(),
    excludeDates: z.array(z.string().datetime()).optional(),
    selectedDates: z.array(z.string().datetime()).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  scheduleStatus: z.enum(['active', 'paused', 'ended']).default('active'),
});

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['active', 'paused', 'ended']).optional(),
  sortBy: z.enum(['createdAt', 'nextDeliveryAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET - fetch all recurring orders for the authenticated user
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();
    const url = new URL(request.url);
    const query = querySchema.parse({
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
      status: url.searchParams.get('status') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
    });

    const user = (request as AuthenticatedRequest).user;
    const { page, limit, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build filter for recurring orders
    const filter: Record<string, unknown> = {
      customerId: user.userId,
      isRecurring: true,
    };

    if (status) {
      filter.scheduleStatus = status;
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
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

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
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error fetching recurring orders:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch recurring orders' 
    }, { status: 500 });
  }
});

// POST - create a recurring order from an existing order
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();
    const body = await request.json();
    const user = (request as AuthenticatedRequest).user;

    // Validate the request body
    const data = recurringOrderSchema.parse(body);

    // Check if sourceOrderId is provided to copy from existing order
    if (!body.sourceOrderId) {
      return NextResponse.json({ 
        error: 'sourceOrderId is required to create recurring order' 
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(body.sourceOrderId)) {
      return NextResponse.json({ 
        error: 'Invalid source order ID' 
      }, { status: 400 });
    }

    // Get the source order
    const sourceOrder = await Order.findById(body.sourceOrderId);
    if (!sourceOrder) {
      return NextResponse.json({ 
        error: 'Source order not found' 
      }, { status: 404 });
    }

    // Verify ownership
    if (String(sourceOrder.customerId) !== String(user.userId)) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Create new recurring order based on source order
    const recurringOrderData = {
      ...sourceOrder.toObject(),
      _id: new mongoose.Types.ObjectId(),
      orderNumber: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      isRecurring: data.isRecurring,
      recurrence: data.recurrence ? {
        ...data.recurrence,
        startDate: data.recurrence.startDate ? new Date(data.recurrence.startDate) : undefined,
        endDate: data.recurrence.endDate ? new Date(data.recurrence.endDate) : undefined,
        includeDates: data.recurrence.includeDates?.map(d => new Date(d)),
        excludeDates: data.recurrence.excludeDates?.map(d => new Date(d)),
        selectedDates: data.recurrence.selectedDates?.map(d => new Date(d)),
      } : undefined,
      nextDeliveryAt: data.nextDeliveryAt ? new Date(data.nextDeliveryAt) : undefined,
      scheduleStatus: data.scheduleStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Remove version key if it exists
    if ('__v' in recurringOrderData) {
      delete (recurringOrderData as Record<string, unknown>).__v;
    }

    const newOrder = new Order(recurringOrderData);
    const savedOrder = await newOrder.save();

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate({ 
        path: 'items.productId', 
        model: 'EnhancedProduct', 
        select: 'name price images stockQty sku' 
      });

    return NextResponse.json({
      success: true,
      data: populatedOrder,
      message: 'Recurring order created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error creating recurring order:', error);
    return NextResponse.json({ 
      error: 'Failed to create recurring order' 
    }, { status: 500 });
  }
});
