import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SupplierUpload from '@/lib/models/SupplierUpload';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const DELETE = requireAuth(async (request: NextRequest & { user?: { userId?: string; mongoId?: string } }) => {
  try {
    await connectDB();
    const authUser = request.user;
    if (!authUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    // determine supplierId from user's record
    const userDoc = authUser.mongoId
      ? await User.findById(authUser.mongoId).lean()
      : await User.findOne({ userId: authUser.userId }).lean();
    const supplierId = userDoc?.supplierId?.toString?.() || null;
    if (!supplierId) return NextResponse.json({ error: 'User is not linked to a supplier account' }, { status: 403 });

    const body = await request.json();
    const { uploadId } = body as { uploadId?: string };
    if (!uploadId) return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });

    const upload = await SupplierUpload.findById(uploadId).lean();
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    // ensure upload belongs to the supplier
  const candidate = (upload as Record<string, unknown>).supplierId;
  const uploadSupplierId = typeof candidate === 'string' ? candidate : (candidate && typeof (candidate as { toString?: () => string }).toString === 'function' ? (candidate as { toString: () => string }).toString() : candidate);
    if (!uploadSupplierId || uploadSupplierId !== supplierId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // remove file from disk if present
    try {
      if (upload.path) {
        const p = path.join(process.cwd(), 'public', upload.path.replace(/^\//, ''));
        await fs.promises.unlink(p).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to unlink upload file', e);
    }

    await SupplierUpload.deleteOne({ _id: uploadId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supplier delete upload error', error);
    return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
  }
});
