import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SupplierUpload from '@/lib/models/SupplierUpload';
import Supplier from '@/lib/models/Supplier';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest & { user?: { role?: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const uploads = await SupplierUpload.find().sort({ createdAt: -1 }).lean();

    // use persisted supplierName when available, otherwise attempt a lookup
    // Return resolved supplierId (fix legacy case where supplierId was a User._id)
    type UploadRow = { supplierId?: unknown; supplierName?: string } & Record<string, unknown>;

    const result = await Promise.all(
      uploads.map(async (uRaw) => {
        const u = uRaw as UploadRow;
        let supplierName = u.supplierName || null;
        let supplierCompany: string | null = null;
        let supplierEmail: string | null = null;
        let supplierPhone: string | null = null;
        let supplierContactName: string | null = null;
        let supplierStatus: string | null = null;
        let resolvedSupplierId = u.supplierId as string;

        if (!supplierName) {
          try {
            // try supplier lookup first
            const candidate = u.supplierId;
            const idStr = typeof candidate === 'string' ? candidate : (candidate && typeof (candidate as { toString?: () => string }).toString === 'function' ? (candidate as { toString: () => string }).toString() : undefined);
            const s = idStr ? await Supplier.findById(idStr).lean() as unknown | null : null;
            if (s) {
              const ss = s as Record<string, unknown>;
              supplierName = (ss.name as string) || (ss.companyName as string) || null;
              supplierCompany = (ss.companyName as string) || (ss.name as string) || null;
              supplierEmail = (ss.email as string) || null;
              supplierPhone = (ss.phone as string) || null;
              supplierContactName = (ss.contactName as string) || null;
              supplierStatus = (ss.status as string) || null;
              resolvedSupplierId = (ss._id && typeof (ss._id as { toString?: () => string }).toString === 'function') ? (ss._id as { toString: () => string }).toString() : resolvedSupplierId;
            } else {
              // maybe upload.supplierId points to a User._id (legacy bug). Try to resolve
              const UserModel = (await import('@/lib/models/User')).default;
              const maybeUser = idStr ? await UserModel.findById(idStr).lean() as unknown | null : null;
              if (maybeUser && (maybeUser as Record<string, unknown>).supplierId) {
                const linkedSupplier = await Supplier.findById(String((maybeUser as Record<string, unknown>).supplierId)).lean() as unknown | null;
                if (linkedSupplier) {
                  const ls = linkedSupplier as Record<string, unknown>;
                  supplierName = (ls.name as string) || (ls.companyName as string) || null;
                  supplierCompany = (ls.companyName as string) || (ls.name as string) || null;
                  supplierEmail = (ls.email as string) || null;
                  supplierPhone = (ls.phone as string) || null;
                  supplierContactName = (ls.contactName as string) || null;
                  supplierStatus = (ls.status as string) || null;
                  resolvedSupplierId = (ls._id && typeof (ls._id as { toString?: () => string }).toString === 'function') ? (ls._id as { toString: () => string }).toString() : resolvedSupplierId;
                }
              }
            }
          } catch {
            // ignore resolution errors
          }
        } else {
          // ensure supplierId is normalized to a supplier _id string when possible and fetch contact fields
          try {
            const s = await Supplier.findById(u.supplierId as string).lean() as unknown | null;
            if (s) {
              const ss = s as Record<string, unknown>;
              supplierCompany = (ss.companyName as string) || (ss.name as string) || null;
              supplierEmail = (ss.email as string) || null;
              supplierPhone = (ss.phone as string) || null;
              supplierContactName = (ss.contactName as string) || null;
              supplierStatus = (ss.status as string) || null;
              resolvedSupplierId = (ss._id && typeof (ss._id as { toString?: () => string }).toString === 'function') ? (ss._id as { toString: () => string }).toString() : resolvedSupplierId;
            }
          } catch {
            // ignore
          }
        }

        return { ...u, supplierId: resolvedSupplierId, supplierName, supplierCompany, supplierEmail, supplierPhone, supplierContactName, supplierStatus };
      })
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Admin supplier uploads list error', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
});
