import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import Supplier from '@/lib/models/Supplier';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(3),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  paymentTerms: z.enum(['net-15', 'net-30', 'net-60', 'net-90', 'cod', 'prepaid']).default('net-30'),
  notes: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const GET = requireAdmin(async (request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Supplier.countDocuments(filter),
    ]);

    return NextResponse.json({ suppliers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request) => {
  try {
    await connectDB();
    const body = await request.json();
    const data = supplierSchema.parse(body);

    const existing = await Supplier.findOne({ email: data.email });
    if (existing) {
      return NextResponse.json({ error: 'Supplier with this email already exists' }, { status: 400 });
    }

    const supplier = await Supplier.create(data);
    await logAuditAction(request.user!.userId, 'create', 'supplier', supplier._id.toString(), undefined, supplier.toObject(), request);
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Create supplier error:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
});
