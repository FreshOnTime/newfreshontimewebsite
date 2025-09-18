import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SupplierUpload from '@/lib/models/SupplierUpload';
import Supplier from '@/lib/models/Supplier';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/auth';

export const POST = requireAdmin(async () => {
  try {
    await connectDB();
    const uploads = await SupplierUpload.find().lean();
    let updated = 0;

    type UploadRow = { _id: string; supplierId?: unknown } & Record<string, unknown>;

    interface MaybeUser { supplierId?: { toString: () => string } }
    for (const uRaw of uploads as unknown[]) {
      const u = uRaw as UploadRow;
      const candidateId = u.supplierId;
      // check if supplier exists for the id (support string-like ids)
      const idStr = typeof candidateId === 'string' ? candidateId : (candidateId && typeof (candidateId as { toString?: () => string }).toString === 'function' ? (candidateId as { toString: () => string }).toString() : undefined);
      if (!idStr) continue;
      const exists = await Supplier.findById(idStr).lean();
      if (exists) continue;

      // maybe it's a user id; try to find a user and get their supplierId
      const maybeUser = await User.findById(idStr).lean();
      if (maybeUser && (maybeUser as MaybeUser).supplierId) {
        const sid = (maybeUser as MaybeUser).supplierId;
        if (sid) {
          const newSupplierId = sid.toString();
          const s = await Supplier.findById(newSupplierId).lean();
          await SupplierUpload.updateOne({ _id: u._id }, { $set: { supplierId: newSupplierId, supplierName: (s as unknown & { name?: string })?.name || null } });
          updated++;
        }
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Backfill supplier uploads error', error);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
});
