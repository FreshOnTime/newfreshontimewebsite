import { NextResponse } from 'next/server';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { ImageUploadError, readBlogImage, storeBlogImage } from '@/lib/blogImageUpload';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export const POST = requireAdminSimple(async request => {
  try {
    const image = await readBlogImage(request);
    const url = await storeBlogImage(image);

    return NextResponse.json({
      success: true,
      message: 'Blog image uploaded',
      data: {
        url,
        filename: image.filename,
        originalName: image.originalName,
        size: image.bytes.length,
        type: image.mimeType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof ImageUploadError ? error.message : 'Unable to upload this image. Please retry.' },
      { status: error instanceof ImageUploadError ? error.status : 500 }
    );
  }
});
