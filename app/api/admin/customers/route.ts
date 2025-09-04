import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import Customer from '@/lib/models/Customer';
import Order from '@/lib/models/EnhancedOrder';
import User from '@/lib/models/User';
import type { Types } from 'mongoose';
import { requireAdminSimple, logAuditAction, checkRateLimit, getClientIP } from '@/lib/middleware/adminAuth';

type CustomerAgg = {
  _id: typeof import('mongoose')['Types']['ObjectId'];
  name: string;
  email: string;
  phone?: string;
  address?: Record<string, unknown>;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: Date;
  createdAt?: Date;
};

const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().max(1000).optional(),
});

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'totalSpent']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const GET = requireAdminSimple(async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Build filter
    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (query.page - 1) * query.limit;

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;

    // Execute primary query against Customer collection
    const [customers, total, globalTotal] = await Promise.all([
      Customer.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Customer.countDocuments(filter),
      Customer.estimatedDocumentCount(),
    ]);

    // Enrich customers with order aggregates (count, totalSpent, lastOrderDate)
    if (customers.length > 0) {
      const ids = customers.map((c) => c._id);
      const aggregates = await Order.aggregate([
        { $match: { customerId: { $in: ids } } },
        {
          $group: {
            _id: '$customerId',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            lastOrderDate: { $max: '$createdAt' },
          },
        },
      ]);
      const aggMap = new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate: Date }>();
      for (const a of aggregates) {
        aggMap.set(String(a._id), {
          totalOrders: a.totalOrders || 0,
          totalSpent: a.totalSpent || 0,
          lastOrderDate: a.lastOrderDate,
        });
      }
      for (let i = 0; i < customers.length; i++) {
        const c = customers[i] as unknown as CustomerAgg;
        const agg = aggMap.get(String(c._id));
        if (agg) {
          c.totalOrders = agg.totalOrders;
          c.totalSpent = agg.totalSpent;
          c.lastOrderDate = agg.lastOrderDate;
        }
        customers[i] = c as unknown as typeof customers[number];
      }
    }

    // If the Customer collection is empty, fall back to Users with role "customer"
  if (globalTotal === 0) {
      // Build user filter based on search
      const userFilter: Record<string, unknown> = { role: 'customer' };
      if (query.search) {
        userFilter.$or = [
          { firstName: { $regex: query.search, $options: 'i' } },
          { lastName: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
          { phoneNumber: { $regex: query.search, $options: 'i' } },
        ];
      }

      // Map sort fields for User model
      const userSort: Record<string, 1 | -1> = {};
      const sortField = query.sortBy === 'name' ? 'firstName'
                       : query.sortBy === 'email' ? 'email'
                       : 'createdAt';
      userSort[sortField] = query.sortOrder === 'asc' ? 1 : -1;

      type UserLean = {
        _id: Types.ObjectId;
        firstName: string;
        lastName?: string;
        email?: string;
        phoneNumber: string;
        registrationAddress?: {
          city?: string;
          state?: string;
          countryCode?: string;
        };
        createdAt?: Date;
      };

      const [userDocs, usersTotal] = await Promise.all([
        User.find(userFilter)
          .sort(userSort)
          .skip(skip)
          .limit(query.limit)
          .lean<UserLean[]>(),
        User.countDocuments(userFilter),
      ]);

      // Map Users to Customer-like shape expected by UI
      const mapped = userDocs.map((u: UserLean) => ({
        _id: u._id.toString(),
        name: `${u.firstName} ${u.lastName ?? ''}`.trim(),
        email: u.email || '',
        phone: u.phoneNumber,
        address: u.registrationAddress
          ? {
              city: u.registrationAddress.city || '',
              state: u.registrationAddress.state || '',
              country: u.registrationAddress.countryCode || '',
            }
          : undefined,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: u.createdAt as Date,
        source: 'user' as const,
      }));

      return NextResponse.json({
        customers: mapped,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: usersTotal,
          pages: Math.ceil(usersTotal / query.limit),
        },
      });
    }

    // Default: return Customer collection results
    return NextResponse.json({
      customers: customers.map((c) => ({ ...c, source: 'customer' as const })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(`create-customer-${clientIP}`, 10, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();
    const data = createCustomerSchema.parse(body);

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: data.email });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      );
    }

    // Create customer
    const customer = await Customer.create(data);

    // Log audit action
    await logAuditAction(
      request.user!.userId,
      'create',
      'customer',
      customer._id.toString(),
      undefined,
      customer.toObject(),
      request
    );

    return NextResponse.json(
      { customer },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
});
