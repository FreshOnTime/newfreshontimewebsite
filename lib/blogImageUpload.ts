import { getBlogImageStorage as azureStorage } from '@/lib/storage/azureStorage';
import { getBlogImageStorage as localStorage } from '@/lib/storage/localStorage';
import { ImageUploadError, readProductImage } from '@/lib/productImageUpload';

export { ImageUploadError };
export const readBlogImage = readProductImage;

export async function storeBlogImage(image: Awaited<ReturnType<typeof readBlogImage>>) {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return azureStorage().uploadFile(image.filename, image.bytes, image.mimeType);
  }

  if (
    process.env.NETLIFY ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production'
  ) {
    throw new ImageUploadError('Blog image storage is not configured. Contact an administrator.', 503);
  }

  return localStorage().uploadFile(image.filename, image.bytes, image.mimeType);
}
