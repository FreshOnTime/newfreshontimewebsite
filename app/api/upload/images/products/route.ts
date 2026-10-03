import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRoles } from '@/lib/middleware/auth';
import { readProductImage, storeProductImage, ImageUploadError } from '@/lib/productImageUpload';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const POST = requireRoles(['admin', 'inventory_manager', 'supplier'])(async request => {
  try {
    const account = await prisma.user.findUnique({ where: { id: request.user!._id }, include: { supplier: true } });
    const roles = [account?.role, ...(account?.secondaryRoles || [])];
    if (!roles.includes('admin') && !roles.includes('inventory_manager') && (!account?.supplier || account.supplier.applicationStatus !== 'approved' || account.supplier.status !== 'active')) return NextResponse.json({ error: 'Supplier approval is required before uploading catalogue images' }, { status: 403 });
    const image = await readProductImage(request);
    const url = await storeProductImage(image);
    return NextResponse.json({ success: true, message: 'Image uploaded', data: { url, filename: image.filename, originalName: image.originalName, size: image.bytes.length, type: image.mimeType } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ImageUploadError ? error.message : 'Unable to upload this image. Please retry.' }, { status: error instanceof ImageUploadError ? error.status : 500 });
  }
});
