import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const POST = requireAdmin(async () => {
  try {
    // In the Postgres model supplierId is a real FK to Supplier, so the legacy
    // "supplierId actually points to a User id" case can no longer occur. This
    // endpoint now just backfills the denormalised display fields for any upload
    // rows that are still missing a supplierName.
    const uploads = await prisma.supplierUpload.findMany({
      where: { supplierName: null },
      include: { supplier: true },
    });
    let updated = 0;

    for (const u of uploads) {
      const s = u.supplier;
      if (!s) continue;
      await prisma.supplierUpload.update({
        where: { id: u.id },
        data: {
          supplierName: s.name,
          supplierCompany: u.supplierCompany || s.name,
          supplierEmail: u.supplierEmail || s.email,
          supplierPhone: u.supplierPhone || s.phone,
          supplierContactName: u.supplierContactName || s.contactName,
          supplierStatus: u.supplierStatus || s.status,
        },
      });
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Backfill supplier uploads error', error);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
});
