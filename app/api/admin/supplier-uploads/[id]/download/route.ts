import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export const GET = requireAdmin(async (_request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    const upload = await prisma.supplierUpload.findUnique({
      where: { id },
      select: { originalName: true, filename: true, mimeType: true, path: true, fileData: true },
    });
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    let buffer: Buffer | null = null;
    if (upload.fileData) {
      buffer = Buffer.from(upload.fileData, 'base64');
    } else if (upload.path) {
      const publicRoot = path.resolve(process.cwd(), 'public');
      const candidate = path.resolve(publicRoot, upload.path.replace(/^\/+/, ''));
      if (candidate.startsWith(publicRoot + path.sep) && fs.existsSync(candidate)) {
        buffer = await fs.promises.readFile(candidate);
      }
    }

    if (!buffer) return NextResponse.json({ error: 'Original upload file is unavailable' }, { status: 404 });

    const originalName = upload.originalName || upload.filename || 'supplier-upload.xlsx';
    const safeAscii = originalName.replace(/[^a-zA-Z0-9._-]+/g, '_');
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': upload.mimeType || 'application/octet-stream',
        'Content-Length': String(buffer.length),
        'Content-Disposition': `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(originalName)}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Admin supplier upload download failed', error);
    return NextResponse.json({ error: 'Unable to download this upload' }, { status: 500 });
  }
});
