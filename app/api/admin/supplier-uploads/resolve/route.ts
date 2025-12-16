import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SupplierUpload from '@/lib/models/SupplierUpload';
import Supplier from '@/lib/models/Supplier';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest & { user?: { role?: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const body = await request.json();
    const { uploadId } = body as { uploadId?: string };
    if (!uploadId) return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });

    const upload = await SupplierUpload.findById(uploadId).lean();
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    // Try to resolve supplier info similar to listing logic
    let supplierName: string | null = (upload as Record<string, unknown>).supplierName as string || null;
    let supplierCompany: string | null = null;
    let supplierEmail: string | null = null;
    let supplierPhone: string | null = null;
    let supplierContactName: string | null = null;
    let supplierStatus: string | null = null;
    const candidate = (upload as unknown as { supplierId?: unknown }).supplierId;
    let resolvedSupplierId = typeof candidate === 'string' ? candidate : (candidate && typeof (candidate as { toString?: () => string }).toString === 'function' ? (candidate as { toString: () => string }).toString() : candidate);

    if (!supplierName) {
      const s = await Supplier.findById((upload as Record<string, unknown>).supplierId as string).lean() as unknown | null;
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
        const UserModel = (await import('@/lib/models/User')).default;
        const maybeUser = await UserModel.findById((upload as Record<string, unknown>).supplierId as string).lean() as unknown | null;
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
    }

    // persist changes
    const updated = await SupplierUpload.findByIdAndUpdate(uploadId, { $set: { supplierId: resolvedSupplierId, supplierName, supplierCompany, supplierEmail, supplierPhone, supplierContactName, supplierStatus } }, { new: true }).lean();

    return NextResponse.json({ success: true, upload: updated });
  } catch (error) {
    console.error('Resolve upload error', error);
    return NextResponse.json({ error: 'Failed to resolve upload' }, { status: 500 });
  }
});
