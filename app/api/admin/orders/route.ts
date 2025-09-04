import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import mongoose from 'mongoose';
import Order from '@/lib/models/EnhancedOrder';
import Customer from '@/lib/models/Customer';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  status: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  search: z.string().optional(),
  isRecurring: z.string().optional(), // 'true'|'false'
  scheduleStatus: z.enum(['active','paused','ended']).optional(),
  sort: z.enum(['created-desc','created-asc','next-asc','next-desc']).optional(),
  customerId: z.string().optional(),
});

export const GET = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

  const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
      ];
    }
  if (query.isRecurring === 'true') filter.isRecurring = true;
  if (query.isRecurring === 'false') filter.isRecurring = { $in: [false, undefined] };
  if (query.scheduleStatus) filter.scheduleStatus = query.scheduleStatus;
  if (query.customerId) {
      if (!mongoose.Types.ObjectId.isValid(query.customerId)) {
        return NextResponse.json({ error: 'Invalid customerId' }, { status: 400 });
      }
      filter.customerId = new mongoose.Types.ObjectId(query.customerId);
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    let sort: Record<string, 1 | -1>;
    switch (query.sort) {
      case 'created-asc':
        sort = { createdAt: 1 };
        break;
      case 'next-asc':
        sort = { nextDeliveryAt: 1, createdAt: -1 };
        break;
      case 'next-desc':
        sort = { nextDeliveryAt: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
        break;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    // Optionally enrich with customer name
    const customerIds = Array.from(new Set(orders.map(o => o.customerId?.toString()).filter(Boolean)));
    const customers = await Customer.find({ _id: { $in: customerIds } }, { name: 1 }).lean();
    const customerMap = new Map<string, string>(
      customers.map((c: unknown) => {
        const anyC = c as { _id?: unknown; name?: unknown };
        return [String(anyC._id ?? ''), String(anyC.name ?? '')];
      })
    );
    const results = orders.map(o => ({ ...o, customerName: customerMap.get(o.customerId?.toString() || '') || '' }));

    return NextResponse.json({ orders: results, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
});

// POST - Create a new order (regular or recurring) by admin
const createOrderSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  items: z.array(z.object({
    productId: z.string().min(1),
    sku: z.string().min(1),
    name: z.string().min(1),
    qty: z.number().int().min(1),
    price: z.number().min(0),
    total: z.number().min(0),
  })).min(1),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  discount: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  paymentMethod: z.enum(['card', 'cash', 'bank_transfer', 'digital_wallet']),
  paymentStatus: z.enum(['pending','paid','failed','refunded']).optional().default('pending'),
  shippingAddress: z.object({
  name: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
  name: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  }).optional(),
  notes: z.string().max(1000).optional(),
  // Optional bag metadata
  bagId: z.string().optional(),
  bagName: z.string().optional(),

  // Recurring controls (optional)
  isRecurring: z.boolean().optional().default(false),
  scheduleStatus: z.enum(['active','paused','ended']).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  recurrence: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    includeDates: z.array(z.string().datetime()).optional(),
    excludeDates: z.array(z.string().datetime()).optional(),
    selectedDates: z.array(z.string().datetime()).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
});

export const POST = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Basic customer existence check (optional but helpful)
    const customer = await Customer.findById(data.customerId).lean();
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Build order payload
    const orderNumber = `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const orderDoc: Record<string, unknown> = {
      orderNumber,
      customerId: data.customerId,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      discount: data.discount ?? 0,
      total: data.total,
      status: 'pending',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus ?? 'pending',
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress ?? data.shippingAddress,
      notes: data.notes,
      bagId: data.bagId,
      bagName: data.bagName,
    };

    // Recurring attributes
    if (data.isRecurring) {
      orderDoc.isRecurring = true;
      if (data.scheduleStatus) orderDoc.scheduleStatus = data.scheduleStatus;
      if (data.nextDeliveryAt) orderDoc.nextDeliveryAt = new Date(data.nextDeliveryAt);
      if (data.recurrence) {
        orderDoc.recurrence = {
          ...data.recurrence,
          startDate: data.recurrence.startDate ? new Date(data.recurrence.startDate) : undefined,
          endDate: data.recurrence.endDate ? new Date(data.recurrence.endDate) : undefined,
          includeDates: data.recurrence.includeDates?.map(d => new Date(d)),
          excludeDates: data.recurrence.excludeDates?.map(d => new Date(d)),
          selectedDates: data.recurrence.selectedDates?.map(d => new Date(d)),
        };
      }
    }

    const created = await Order.create(orderDoc);

    const createdDoc = created as unknown as { _id?: unknown; toObject?: () => unknown };
    const createdId = (() => {
      const id = createdDoc._id as unknown;
      if (id && typeof id === 'object' && 'toString' in id) {
        try { return (id as { toString: () => string }).toString(); } catch { return undefined; }
      }
      return undefined;
    })();
    const afterPayload = createdDoc.toObject ? createdDoc.toObject() : (created as unknown);

    await logAuditAction(
      request.user!.userId,
      'create',
      'order',
      createdId,
      undefined,
      afterPayload as Record<string, unknown>,
      request
    );

    return NextResponse.json({ order: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
});
