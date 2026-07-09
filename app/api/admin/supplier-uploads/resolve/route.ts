import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest & { user?: { role?: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const { uploadId } = body as { uploadId?: string };
    if (!uploadId) return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });

    const upload = await prisma.supplierUpload.findUnique({
      where: { id: uploadId },
      include: { supplier: true },
    });
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    // supplierId is a real FK now, so the joined supplier record is authoritative.
    // Persist the resolved display fields back onto the upload row.
    const s = upload.supplier;
    const updated = await prisma.supplierUpload.update({
      where: { id: uploadId },
      data: {
        supplierName: upload.supplierName || s?.name || null,
        supplierCompany: s?.name || upload.supplierCompany || null,
        supplierEmail: s?.email || upload.supplierEmail || null,
        supplierPhone: s?.phone || upload.supplierPhone || null,
        supplierContactName: s?.contactName || upload.supplierContactName || null,
        supplierStatus: s?.status || upload.supplierStatus || null,
      },
    });

    return NextResponse.json({ success: true, upload: { ...updated, _id: updated.id } });
  } catch (error) {
    console.error('Resolve upload error', error);
    return NextResponse.json({ error: 'Failed to resolve upload' }, { status: 500 });
  }
});
