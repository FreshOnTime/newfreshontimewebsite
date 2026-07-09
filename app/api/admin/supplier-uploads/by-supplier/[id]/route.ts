import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (
  request: NextRequest & { user?: { role?: string } },
  context: { params: Promise<{ id: string }> }
) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Next 16: params is a Promise and must be awaited before use.
    const { id } = await context.params;

    // supplierId is a real FK to Supplier now, so uploads reference the supplier
    // directly (no legacy User-id indirection to resolve).
    const uploads = await prisma.supplierUpload.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' },
    });

    // Ensure uploads include a supplierName field (use persisted or fallback to supplier record)
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    const supplierName = supplier?.name || null;
    const uploadsWithName = uploads.map((u) => ({ ...u, _id: u.id, supplierName: u.supplierName || supplierName }));

    return NextResponse.json({ success: true, data: uploadsWithName });
  } catch (error) {
    console.error('Admin supplier uploads by supplier error', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
});
