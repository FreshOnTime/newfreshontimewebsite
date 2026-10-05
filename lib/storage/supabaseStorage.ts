const DEFAULT_BUCKET = 'freshpick-images';
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function storageConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
  const secretKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET;

  if (!url || !/^https:\/\//i.test(url)) {
    throw new Error('SUPABASE_URL is required for image storage');
  }
  if (!secretKey) {
    throw new Error('SUPABASE_SECRET_KEY is required for image storage');
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(bucket)) {
    throw new Error('SUPABASE_STORAGE_BUCKET contains unsupported characters');
  }

  return { url, secretKey, bucket };
}

function headers(secretKey: string, extra?: HeadersInit): HeadersInit {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    ...extra,
  };
}

async function responseMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
  return body?.message || body?.error || `Supabase Storage request failed (${response.status})`;
}

let bucketReady: Promise<void> | null = null;

async function ensurePublicBucket() {
  if (bucketReady) return bucketReady;

  bucketReady = (async () => {
    const { url, secretKey, bucket } = storageConfig();
    const check = await fetch(`${url}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
      headers: headers(secretKey),
      cache: 'no-store',
    });

    if (check.ok) {
      const existing = await check.json().catch(() => null) as { public?: boolean } | null;
      if (!existing?.public) {
        throw new Error(`Supabase Storage bucket "${bucket}" must be public so storefront images can be served`);
      }
      return;
    }

    if (check.status !== 404) {
      throw new Error(await responseMessage(check));
    }

    const create = await fetch(`${url}/storage/v1/bucket`, {
      method: 'POST',
      headers: headers(secretKey, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: true,
        file_size_limit: MAX_IMAGE_BYTES,
        allowed_mime_types: ALLOWED_IMAGE_MIME_TYPES,
      }),
    });

    if (!create.ok && create.status !== 409) {
      throw new Error(await responseMessage(create));
    }
  })().catch((error) => {
    bucketReady = null;
    throw error;
  });

  return bucketReady;
}

function objectPath(folder: string, fileName: string) {
  const safeFolder = folder.replace(/^\/+|\/+$/g, '');
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_');
  if (!safeFolder || !safeName) throw new Error('Invalid Supabase Storage object path');
  return `${safeFolder}/${safeName}`;
}

function encodedObjectPath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export class SupabaseStorageService {
  constructor(private readonly folder: string) {}

  async uploadFile(fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
      throw new Error('Unsupported image type');
    }
    if (!fileBuffer.length || fileBuffer.length > MAX_IMAGE_BYTES) {
      throw new Error('Image must be within 4 MB');
    }

    await ensurePublicBucket();
    const { url, secretKey, bucket } = storageConfig();
    const path = objectPath(this.folder, fileName);

    const response = await fetch(
      `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedObjectPath(path)}`,
      {
        method: 'POST',
        headers: headers(secretKey, {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'x-upsert': 'false',
        }),
        body: new Uint8Array(fileBuffer),
      },
    );

    if (!response.ok) {
      throw new Error(await responseMessage(response));
    }

    return `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedObjectPath(path)}`;
  }
}

let productImageStorage: SupabaseStorageService | null = null;
let categoryImageStorage: SupabaseStorageService | null = null;
let bannerImageStorage: SupabaseStorageService | null = null;
let blogImageStorage: SupabaseStorageService | null = null;

export function getProductImageStorage() {
  if (!productImageStorage) productImageStorage = new SupabaseStorageService('product-images');
  return productImageStorage;
}

export function getCategoryImageStorage() {
  if (!categoryImageStorage) categoryImageStorage = new SupabaseStorageService('category-images');
  return categoryImageStorage;
}

export function getBannerImageStorage() {
  if (!bannerImageStorage) bannerImageStorage = new SupabaseStorageService('banner-images');
  return bannerImageStorage;
}

export function getBlogImageStorage() {
  if (!blogImageStorage) blogImageStorage = new SupabaseStorageService('blog-images');
  return blogImageStorage;
}
