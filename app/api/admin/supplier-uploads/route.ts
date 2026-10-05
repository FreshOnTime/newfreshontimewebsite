import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async () => {
  try {
    const uploads = await prisma.supplierUpload.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        supplierId: true,
        supplierName: true,
        supplierCompany: true,
        supplierEmail: true,
        supplierPhone: true,
        supplierContactName: true,
        supplierStatus: true,
        originalName: true,
        filename: true,
        mimeType: true,
        size: true,
        path: true,
        preview: true,
        createdAt: true,
        supplier: {
          select: {
            name: true,
            email: true,
            phone: true,
            contactName: true,
            status: true,
          },
        },
      },
    });

    // Never return fileData from a list endpoint. Production uploads can store the
    // full spreadsheet inline as base64 and returning every blob makes the admin
    // queue unnecessarily large. The protected download endpoint streams the
    // original file on demand.
    const result = uploads.map((u) => {
      const { supplier: s, ...rest } = u;
      return {
        ...rest,
        _id: u.id,
        supplierName: u.supplierName || s?.name || null,
        supplierCompany: s?.name || u.supplierCompany || null,
        supplierEmail: s?.email || u.supplierEmail || null,
        supplierPhone: s?.phone || u.supplierPhone || null,
        supplierContactName: s?.contactName || u.supplierContactName || null,
        supplierStatus: s?.status || u.supplierStatus || null,
      };
    });

    return NextResponse.json(
      { success: true, data: result },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('Admin supplier uploads list error', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
});
