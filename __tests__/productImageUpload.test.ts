import { readProductImage, storeProductImage } from '@/lib/productImageUpload';

jest.mock('@/lib/storage/supabaseStorage', () => ({
  getProductImageStorage: () => ({ uploadFile: jest.fn() }),
  getCategoryImageStorage: () => ({ uploadFile: jest.fn() }),
}));
jest.mock('@/lib/storage/localStorage', () => ({
  getProductImageStorage: () => ({ uploadFile: jest.fn() }),
  getCategoryImageStorage: () => ({ uploadFile: jest.fn() }),
}));

function upload(bytes: Uint8Array, type: string) {
  const form = new FormData();
  form.set('image', new Blob([bytes], { type }), '../../bad.svg');
  return new Request('http://localhost', { method: 'POST', body: form });
}

it('rejects SVG and fake MIME headers', async () => {
  await expect(readProductImage(upload(new TextEncoder().encode('<svg/>'), 'image/png'))).rejects.toThrow('valid');
});

it('rejects oversized requests before reading', async () => {
  const request = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data; boundary=x', 'Content-Length': String(5 * 1024 * 1024) },
    body: 'x',
  });
  await expect(readProductImage(request)).rejects.toMatchObject({ status: 413 });
});

it('uses an independent filename and a detected raster extension', async () => {
  const image = await readProductImage(upload(new Uint8Array([137,80,78,71,13,10,26,10]), 'image/png'));
  expect(image.filename).toMatch(/^[a-f0-9-]+\.png$/);
  expect(image.filename).not.toContain('bad');
});

it('does not persist serverless images to ephemeral disk when Supabase Storage is missing', async () => {
  const oldNetlify = process.env.NETLIFY;
  const oldUrl = process.env.SUPABASE_URL;
  const oldSecret = process.env.SUPABASE_SECRET_KEY;
  const oldLegacySecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NETLIFY = 'true';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    await expect(storeProductImage({
      bytes: Buffer.from('x'),
      filename: 'file.png',
      mimeType: 'image/png',
      originalName: 'x',
    })).rejects.toMatchObject({ status: 503 });
  } finally {
    if (oldNetlify === undefined) delete process.env.NETLIFY; else process.env.NETLIFY = oldNetlify;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldSecret === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldSecret;
    if (oldLegacySecret === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = oldLegacySecret;
  }
});
