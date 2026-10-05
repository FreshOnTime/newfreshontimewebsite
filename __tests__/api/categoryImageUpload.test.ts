import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/images/categories/route';
import { ImageUploadError, readProductImage, storeCategoryImage } from '@/lib/productImageUpload';

jest.mock('@/lib/middleware/adminAuth', () => ({
  requireAdminSimple: (handler: unknown) => handler,
}));

jest.mock('@/lib/productImageUpload', () => {
  class MockImageUploadError extends Error {
    constructor(message: string, public status = 400) {
      super(message);
    }
  }
  return {
    ImageUploadError: MockImageUploadError,
    readProductImage: jest.fn(),
    storeCategoryImage: jest.fn(),
  };
});

const readImage = readProductImage as jest.Mock;
const storeImage = storeCategoryImage as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

it('stores validated category images and returns their durable URL', async () => {
  readImage.mockResolvedValue({
    bytes: Buffer.from('image'),
    mimeType: 'image/webp',
    filename: 'category.webp',
    originalName: 'produce.webp',
  });
  storeImage.mockResolvedValue('https://project.supabase.co/storage/v1/object/public/freshpick-images/category-images/category.webp');

  const response = await POST(new Request('http://localhost/api/upload/images/categories', {
    method: 'POST',
  }) as unknown as NextRequest);

  expect(response.status).toBe(200);
  expect(storeImage).toHaveBeenCalledWith(expect.objectContaining({ filename: 'category.webp' }));
  expect(await response.json()).toMatchObject({
    success: true,
    data: { url: 'https://project.supabase.co/storage/v1/object/public/freshpick-images/category-images/category.webp' },
  });
});

it('preserves image validation status codes for invalid category uploads', async () => {
  readImage.mockRejectedValue(new ImageUploadError('Image uploads must be within 4 MB', 413));

  const response = await POST(new Request('http://localhost/api/upload/images/categories', {
    method: 'POST',
  }) as unknown as NextRequest);

  expect(response.status).toBe(413);
  expect(await response.json()).toEqual({ error: 'Image uploads must be within 4 MB' });
  expect(storeImage).not.toHaveBeenCalled();
});
