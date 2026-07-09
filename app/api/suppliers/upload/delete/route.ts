import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const DELETE = requireAuth(async (request: NextRequest & { user?: { userId?: string; mongoId?: string } }) => {
  try {
    const authUser = request.user;
    if (!authUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    // determine supplierId from user's record
    const uid = authUser.mongoId || authUser.userId;
    const userDoc = uid ? await prisma.user.findUnique({ where: { id: uid } }) : null;
    const supplierId = userDoc?.supplierId || null;
    if (!supplierId) return NextResponse.json({ error: 'User is not linked to a supplier account' }, { status: 403 });

    const body = await request.json();
    const { uploadId } = body as { uploadId?: string };
    if (!uploadId) return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });

    const upload = await prisma.supplierUpload.findFirst({ where: { id: uploadId, supplierId } });
    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    // remove file from disk if present
    try {
      if (upload.path) {
        const filePath = path.join(process.cwd(), 'public', upload.path.replace(/^\//, ''));
        await fs.promises.unlink(filePath).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to unlink upload file', e);
    }

    await prisma.supplierUpload.deleteMany({ where: { id: uploadId, supplierId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supplier delete upload error', error);
    return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
  }
});
