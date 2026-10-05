import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { GET as listSupplierProducts } from '@/app/api/suppliers/products/route';
import { GET as listAdminSupplierUploads } from '@/app/api/admin/supplier-uploads/route';
import { POST as importSupplierUpload } from '@/app/api/admin/supplier-uploads/import/route';
import { GET as downloadSupplierUpload } from '@/app/api/admin/supplier-uploads/[id]/download/route';
import { PATCH as reviewSupplierApplication } from '@/app/api/admin/supplier-applications/route';

jest.mock('@/lib/auth', () => ({
  requireAuth: (handler: unknown) => handler,
  requireAdmin: (handler: unknown) => handler,
}));
jest.mock('@/lib/middleware/adminAuth', () => ({
  requireAdmin: (handler: unknown) => handler,
  requireAdminSimple: (handler: unknown) => handler,
  logAuditAction: jest.fn(),
}));
jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    supplier: { findUnique: jest.fn(), updateMany: jest.fn() },
    supplierUpload: { findUnique: jest.fn(), findMany: jest.fn() },
    product: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    category: { findUnique: jest.fn() },
    notification: { createMany: jest.fn() },
  },
}));

const db = prisma as unknown as {
  $transaction: jest.Mock;
  user: { findUnique: jest.Mock; findMany: jest.Mock };
  supplier: { findUnique: jest.Mock; updateMany: jest.Mock };
  supplierUpload: { findUnique: jest.Mock; findMany: jest.Mock };
  product: { findMany: jest.Mock; count: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
  category: { findUnique: jest.Mock };
  notification: { createMany: jest.Mock };
};

function req(url: string, method = 'GET', body?: unknown, user = { userId: 'supplier-user', role: 'supplier' }) {
  return Object.assign(new Request(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }), { user }) as unknown as NextRequest & { user: typeof user };
}

beforeEach(() => {
  jest.clearAllMocks();
  db.$transaction.mockImplementation((value: unknown) => typeof value === 'function'
    ? (value as (tx: typeof prisma) => unknown)(prisma)
    : Promise.all(value as Promise<unknown>[]));
  db.user.findMany.mockResolvedValue([]);
  db.notification.createMany.mockResolvedValue({ count: 0 });
});

it('lists imported products back to the owning approved supplier', async () => {
  db.user.findUnique.mockResolvedValue({ supplier: { id: 'supplier-1', applicationStatus: 'approved', status: 'active' } });
  db.product.findMany.mockResolvedValue([{
    id: 'p1', sku: 'FP-1', name: 'Tomatoes', price: 350, costPrice: 250,
    stockQty: 12, minStockLevel: 5, archived: false,
    category: { name: 'Fresh Produce', slug: 'fresh-produce' },
    createdAt: new Date(), updatedAt: new Date(),
  }]);
  db.product.count.mockResolvedValue(1);

  const response = await listSupplierProducts(req('http://localhost/api/suppliers/products?limit=100'));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    products: [{ id: 'p1', sku: 'FP-1', name: 'Tomatoes', price: 350, stockQty: 12 }],
    pagination: { total: 1 },
  });
  expect(db.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ supplierId: 'supplier-1' }),
  }));
});

it('imports the actual template fields into a supplier product', async () => {
  const csv = [
    'sku,name,description,price,costPrice,stockQty,minStockLevel,categorySlug,tags,unit,unitQuantity,supplierSku,imageUrl',
    'FP-BANANA-001,Fresh Banana,Yellow ripe bananas,350,250,100,10,fresh-produce,"fruit,banana",kg,1,BN-001,',
  ].join('\n');
  db.supplierUpload.findUnique.mockResolvedValue({
    id: 'upload-1',
    supplierId: 'supplier-1',
    fileData: Buffer.from(csv).toString('base64'),
    originalName: 'catalogue.csv',
    filename: 'catalogue.csv',
    mimeType: 'text/csv',
    preview: [],
  });
  db.category.findUnique.mockResolvedValue({ id: 'category-1' });
  db.product.findUnique.mockResolvedValue(null);
  db.product.create.mockResolvedValue({ id: 'product-1' });

  const response = await importSupplierUpload(req(
    'http://localhost/api/admin/supplier-uploads/import',
    'POST',
    { uploadId: 'upload-1' },
    { userId: 'admin-1', role: 'admin' },
  ));
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.results.created).toEqual([{ sku: 'FP-BANANA-001', id: 'product-1' }]);
  expect(db.product.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      sku: 'FP-BANANA-001',
      name: 'Fresh Banana',
      price: 350,
      costPrice: 250,
      stockQty: 100,
      minStockLevel: 10,
      categoryId: 'category-1',
      supplierId: 'supplier-1',
      tags: ['fruit', 'banana'],
      attributes: expect.objectContaining({
        supplierSku: 'BN-001',
        unitOptions: [{ label: '1kg', quantity: 1, unit: 'kg', price: 350 }],
      }),
    }),
  });
});

it('updates the same supplier SKU on a re-import instead of duplicating it', async () => {
  const csv = 'sku,name,price,stockQty\nFP-1,Tomatoes,400,25';
  db.supplierUpload.findUnique.mockResolvedValue({
    supplierId: 'supplier-1',
    fileData: Buffer.from(csv).toString('base64'),
    originalName: 'catalogue.csv',
    filename: 'catalogue.csv',
    mimeType: 'text/csv',
    preview: [],
  });
  db.product.findUnique.mockResolvedValue({ id: 'product-1', supplierId: 'supplier-1' });
  db.product.update.mockResolvedValue({ id: 'product-1' });

  const response = await importSupplierUpload(req(
    'http://localhost/api/admin/supplier-uploads/import',
    'POST',
    { uploadId: 'upload-1' },
    { userId: 'admin-1', role: 'admin' },
  ));
  const data = await response.json();
  expect(data.results.updated).toEqual([{ sku: 'FP-1', id: 'product-1' }]);
  expect(db.product.create).not.toHaveBeenCalled();
});

it('downloads a database-backed original spreadsheet from the admin view', async () => {
  const bytes = Buffer.from('spreadsheet-bytes');
  db.supplierUpload.findUnique.mockResolvedValue({
    originalName: 'supplier catalogue.xlsx',
    filename: 'stored.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    path: null,
    fileData: bytes.toString('base64'),
  });

  const response = await downloadSupplierUpload(
    req('http://localhost/api/admin/supplier-uploads/upload-1/download', 'GET', undefined, { userId: 'admin-1', role: 'admin' }),
    { params: Promise.resolve({ id: 'upload-1' }) },
  );
  expect(response.status).toBe(200);
  expect(response.headers.get('content-disposition')).toContain('supplier_catalogue.xlsx');
  expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
});

it('notifies the linked supplier account when an admin approves the application', async () => {
  db.supplier.findUnique.mockResolvedValue({ id: 'supplier-1', name: 'Grower One', applicationStatus: 'pending', reviewVersion: 2 });
  db.supplier.updateMany.mockResolvedValue({ count: 1 });
  db.user.findMany.mockResolvedValue([{ id: 'supplier-user' }]);
  db.notification.createMany.mockResolvedValue({ count: 1 });

  const response = await reviewSupplierApplication(req(
    'http://localhost/api/admin/supplier-applications',
    'PATCH',
    { id: 'supplier-1', version: 2, status: 'approved', notes: 'Approved' },
    { userId: 'admin-1', role: 'admin' },
  ));
  expect(response.status).toBe(200);
  expect(db.notification.createMany).toHaveBeenCalledWith({
    data: [expect.objectContaining({
      targetUserId: 'supplier-user',
      title: 'Supplier application approved',
      type: 'success',
      link: '/dashboard',
    })],
  });
});


it('keeps inline spreadsheet blobs out of admin upload list responses', async () => {
  db.supplierUpload.findMany.mockResolvedValue([{
    id: 'upload-1',
    supplierId: 'supplier-1',
    supplierName: 'Grower One',
    supplierCompany: null,
    supplierEmail: 'grower@example.com',
    supplierPhone: '0771234567',
    supplierContactName: 'Grower',
    supplierStatus: 'active',
    originalName: 'catalogue.xlsx',
    filename: 'stored.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024,
    path: null,
    preview: [{ sku: 'FP-1', name: 'Tomatoes', price: 350 }],
    createdAt: new Date(),
    supplier: { name: 'Grower One', email: 'grower@example.com', phone: '0771234567', contactName: 'Grower', status: 'active' },
  }]);

  const response = await listAdminSupplierUploads(req(
    'http://localhost/api/admin/supplier-uploads',
    'GET',
    undefined,
    { userId: 'admin-1', role: 'admin' },
  ));
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.data[0]).not.toHaveProperty('fileData');
  const args = db.supplierUpload.findMany.mock.calls[0][0];
  expect(args.select).not.toHaveProperty('fileData');
});

it('rejects a supplier import row with no required price instead of creating a free product', async () => {
  const csv = 'sku,name,price\nFP-1,Tomatoes,';
  db.supplierUpload.findUnique.mockResolvedValue({
    supplierId: 'supplier-1',
    fileData: Buffer.from(csv).toString('base64'),
    originalName: 'catalogue.csv',
    filename: 'catalogue.csv',
    mimeType: 'text/csv',
    preview: [],
  });

  const response = await importSupplierUpload(req(
    'http://localhost/api/admin/supplier-uploads/import',
    'POST',
    { uploadId: 'upload-1' },
    { userId: 'admin-1', role: 'admin' },
  ));
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.results.errors).toEqual([{ row: 2, reason: 'Missing price' }]);
  expect(db.product.create).not.toHaveBeenCalled();
  expect(db.product.update).not.toHaveBeenCalled();
});

it('notifies linked supplier accounts after a successful catalogue import', async () => {
  const csv = 'sku,name,price\nFP-1,Tomatoes,400';
  db.supplierUpload.findUnique.mockResolvedValue({
    supplierId: 'supplier-1',
    fileData: Buffer.from(csv).toString('base64'),
    originalName: 'catalogue.csv',
    filename: 'catalogue.csv',
    mimeType: 'text/csv',
    preview: [],
  });
  db.product.findUnique.mockResolvedValue(null);
  db.product.create.mockResolvedValue({ id: 'product-1' });
  db.user.findMany.mockResolvedValue([{ id: 'supplier-user' }]);
  db.notification.createMany.mockResolvedValue({ count: 1 });

  const response = await importSupplierUpload(req(
    'http://localhost/api/admin/supplier-uploads/import',
    'POST',
    { uploadId: 'upload-1' },
    { userId: 'admin-1', role: 'admin' },
  ));
  expect(response.status).toBe(200);
  expect(db.notification.createMany).toHaveBeenCalledWith({
    data: [expect.objectContaining({
      targetUserId: 'supplier-user',
      title: 'Catalogue import completed',
      link: '/dashboard',
      type: 'success',
    })],
  });
});
