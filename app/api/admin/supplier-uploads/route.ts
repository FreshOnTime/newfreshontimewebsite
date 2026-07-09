import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest & { user?: { role?: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const uploads = await prisma.supplierUpload.findMany({
      orderBy: { createdAt: 'desc' },
      include: { supplier: true },
    });

    // supplierId is now a real FK to Supplier, so the joined record is the source
    // of truth. Prefer the persisted display name, then fall back to the live
    // supplier record. (The old Mongo model had no companyName column; map it to
    // the supplier name for backwards-compatible response shape.)
    const result = uploads.map((u) => {
      const { supplier: s, ...rest } = u;
      return {
        ...rest,
        _id: u.id,
        supplierId: u.supplierId,
        supplierName: u.supplierName || s?.name || null,
        supplierCompany: s?.name || u.supplierCompany || null,
        supplierEmail: s?.email || u.supplierEmail || null,
        supplierPhone: s?.phone || u.supplierPhone || null,
        supplierContactName: s?.contactName || u.supplierContactName || null,
        supplierStatus: s?.status || u.supplierStatus || null,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Admin supplier uploads list error', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
});
