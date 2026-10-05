import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async (
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;

    const [uploads, supplier] = await Promise.all([
      prisma.supplierUpload.findMany({
        where: { supplierId: id },
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
        },
      }),
      prisma.supplier.findUnique({ where: { id }, select: { name: true } }),
    ]);

    const supplierName = supplier?.name || null;
    const uploadsWithName = uploads.map(u => ({
      ...u,
      _id: u.id,
      supplierName: u.supplierName || supplierName,
    }));

    return NextResponse.json(
      { success: true, data: uploadsWithName },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('Admin supplier uploads by supplier error', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
});
