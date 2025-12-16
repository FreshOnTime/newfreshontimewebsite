import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SupplierUpload from '@/lib/models/SupplierUpload';
import { requireAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const DELETE = requireAdmin(async (request: NextRequest & { user?: { role?: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const { uploadId } = body as { uploadId?: string };
    if (!uploadId) return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });

    await connectDB();
    const upload = await SupplierUpload.findById(uploadId).lean() as { path?: string } | null;
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    // remove file from disk if present
    try {
      if (upload.path) {
        const p = path.join(process.cwd(), 'public', upload.path.replace(/^\//, ''));
        await fs.promises.unlink(p).catch(() => { });
      }
    } catch (e) {
      console.warn('Failed to unlink upload file', e);
    }

    await SupplierUpload.deleteOne({ _id: uploadId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete upload error', error);
    return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
  }
});
