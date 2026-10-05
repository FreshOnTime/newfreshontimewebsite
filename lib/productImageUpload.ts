import { randomUUID } from 'node:crypto';
import {
  getCategoryImageStorage as azureCategoryStorage,
  getProductImageStorage as azureProductStorage,
} from '@/lib/storage/azureStorage';
import {
  getCategoryImageStorage as localCategoryStorage,
  getProductImageStorage as localProductStorage,
} from '@/lib/storage/localStorage';

export class ImageUploadError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const MAX_FILE = 4 * 1024 * 1024;
const MAX_BODY = MAX_FILE + 256 * 1024;

/** Bound the request before multipart parsing, including requests with no Content-Length. */
export async function readProductImage(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data;')) throw new ImageUploadError('Choose an image to upload');
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new ImageUploadError('Image uploads must be within 4 MB', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ImageUploadError('No image provided');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > MAX_BODY) { await reader.cancel(); throw new ImageUploadError('Image uploads must be within 4 MB', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let form: FormData;
  try { form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': contentType } }).formData(); }
  catch { throw new ImageUploadError('Invalid image upload'); }
  const file = form.get('image');
  if (!file || typeof file === 'string' || form.getAll('image').length !== 1) throw new ImageUploadError('Provide one image');
  if (!file.size || file.size > MAX_FILE) throw new ImageUploadError('Image uploads must be within 4 MB', 413);
  const bytes = Buffer.from(await file.arrayBuffer());
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const isWebp = bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
  const isAvif = bytes.subarray(4,8).toString() === 'ftyp' && ['avif','avis'].includes(bytes.subarray(8,12).toString());
  const format = isPng ? ['png','image/png'] : isJpeg ? ['jpg','image/jpeg'] : isWebp ? ['webp','image/webp'] : isAvif ? ['avif','image/avif'] : null;
  if (!format || (file.type !== format[1] && !(format[1] === 'image/jpeg' && file.type === 'image/jpg'))) throw new ImageUploadError('Use a valid JPEG, PNG, WebP or AVIF image');
  return { bytes, mimeType: format[1], filename: `${randomUUID()}.${format[0]}`, originalName: file.name };
}

export async function storeProductImage(image: Awaited<ReturnType<typeof readProductImage>>) {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) return azureProductStorage().uploadFile(image.filename, image.bytes, image.mimeType);
  if (process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production') throw new ImageUploadError('Product image storage is not configured. Contact an administrator.', 503);
  return localProductStorage().uploadFile(image.filename, image.bytes, image.mimeType);
}

export async function storeCategoryImage(image: Awaited<ReturnType<typeof readProductImage>>) {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) return azureCategoryStorage().uploadFile(image.filename, image.bytes, image.mimeType);
  if (process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production') throw new ImageUploadError('Category image storage is not configured. Contact an administrator.', 503);
  return localCategoryStorage().uploadFile(image.filename, image.bytes, image.mimeType);
}
