import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SupplierUpload from '@/lib/models/SupplierUpload';
import User from '@/lib/models/User';
import Supplier from '@/lib/models/Supplier';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest & { user?: { role?: string } }, { params }: { params: { id: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
  // include uploads where supplierId is the supplier _id OR where supplierId references a User who is linked to this supplier
  const users = await User.find({ supplierId: params.id }).select('_id').lean();
  const userIds = users.map(u => u._id.toString());
  const uploads = await SupplierUpload.find({ $or: [{ supplierId: params.id }, { supplierId: { $in: userIds } }] }).sort({ createdAt: -1 }).lean();

  // Ensure uploads include a supplierName field (use persisted or fallback to supplier record)
  const supplier = await Supplier.findById(params.id).lean();
  const supplierName = supplier?.name || supplier?.companyName || null;
  type UploadRow = { supplierName?: string } & Record<string, unknown>;
  const uploadsWithName = uploads.map((u: UploadRow) => ({ ...u, supplierName: u.supplierName || supplierName }));

    return NextResponse.json({ success: true, data: uploadsWithName });
  } catch (error) {
    console.error('Admin supplier uploads by supplier error', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
});
