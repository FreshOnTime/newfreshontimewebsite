import { getBlogImageStorage as supabaseStorage } from '@/lib/storage/supabaseStorage';
import { getBlogImageStorage as localStorage } from '@/lib/storage/localStorage';
import { ImageUploadError, readProductImage } from '@/lib/productImageUpload';

export { ImageUploadError };
export const readBlogImage = readProductImage;

export async function storeBlogImage(image: Awaited<ReturnType<typeof readBlogImage>>) {
  if (process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return supabaseStorage().uploadFile(image.filename, image.bytes, image.mimeType);
  }

  if (
    process.env.NETLIFY ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production'
  ) {
    throw new ImageUploadError('Supabase image storage is not configured. Contact an administrator.', 503);
  }

  return localStorage().uploadFile(image.filename, image.bytes, image.mimeType);
}
