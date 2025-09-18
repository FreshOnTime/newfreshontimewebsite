import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SupplierUpload from '@/lib/models/SupplierUpload';
import Product from '@/lib/models/Product';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest & { user?: { role?: string; userId?: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const body = await request.json();
    const uploadId = body?.uploadId;
    if (!uploadId) return NextResponse.json({ error: 'uploadId required' }, { status: 400 });

    const upload = await SupplierUpload.findById(uploadId).exec();
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

  const rows = Array.isArray(upload.preview) ? upload.preview as unknown[] : [];
  const results: { created: Array<{ sku: string; id: unknown }>; errors: Array<{ row: number; reason: string }> } = { created: [], errors: [] };

    for (const [i, r] of rows.entries()) {
      // Basic mapping based on template: sku,name,description,price,pricePerBaseQuantity,baseMeasurementQuantity,measurementUnit,stockQty,categorySlug
  const row = r as Record<string, unknown>;
  const sku = String(row.sku || row.SKU || '').trim();
  const name = String(row.name || '').trim();
  const price = Number(row.price || row.Price || 0);
  const baseQty = Number(row.baseMeasurementQuantity || row.baseMeasurementQuantity || 1);
  const measurementUnit = String(row.measurementUnit || row.unit || 'kg');
  const stockQty = Number(row.stockQty || row.stock || 0);

      if (!sku || !name) {
        results.errors.push({ row: i, reason: 'Missing sku or name' });
        continue;
      }

      // For simplicity, create Product with minimal required fields and placeholder refs
      try {
          const product = new Product({
          name,
          image: { url: '/placeholder.svg', alt: name },
          brand: undefined,
          category: undefined,
          description: String(r.description || ''),
          searchContent: `${name} ${r.description || ''}`,
          baseMeasurementQuantity: baseQty || 1,
          pricePerBaseQuantity: price || 0,
          measurementType: measurementUnit as string,
          isSoldAsUnit: measurementUnit === 'ea' || measurementUnit === 'unit',
          minOrderQuantity: 1,
          maxOrderQuantity: 999999,
          stepQuantity: 1,
          stockQuantity: stockQty || 0,
          lowStockThreshold: 0,
          createdBy: request.user?.userId || 'admin',
          updatedBy: request.user?.userId || 'admin'
        });
        await product.save();
        results.created.push({ sku, id: product._id });
        } catch (err) {
          results.errors.push({ row: i, reason: err instanceof Error ? err.message : 'Save error' });
        }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Admin import error', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
});
