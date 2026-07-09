import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Parse a numeric-ish cell safely: strip currency symbols, commas and any other
// non-numeric characters; NaN → 0.
function parseNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Re-parse the original spreadsheet buffer into rows (CSV or Excel).
function parseRows(buffer: Buffer, name: string, mimeType?: string): unknown[] {
  const lowerName = (name || '').toLowerCase();
  const mt = mimeType || '';
  const isCsv = mt === 'text/csv' || lowerName.endsWith('.csv');
  const isExcel = mt.includes('spreadsheet') || mt.includes('excel') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
  if (isCsv) {
    const text = buffer.toString('utf8');
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return parsed.data as unknown[];
  }
  if (isExcel) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    if (!wb.SheetNames || wb.SheetNames.length === 0) return [];
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as unknown[];
  }
  return [];
}

export const POST = requireAuth(async (request: NextRequest & { user?: { role?: string; userId?: string } }) => {
  try {
    if (request.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const uploadId = body?.uploadId;
    if (!uploadId) return NextResponse.json({ error: 'uploadId required' }, { status: 400 });

    const upload = await prisma.supplierUpload.findUnique({ where: { id: uploadId } });
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    // Prefer the full original file (stored inline as base64, or on disk). Fall
    // back to the stored preview only if the full file is unavailable — the
    // preview is capped at 20 rows, so note that limitation in the response.
    let rows: unknown[] = [];
    let usedPreviewFallback = false;
    try {
      if (upload.fileData) {
        const buf = Buffer.from(upload.fileData, 'base64');
        rows = parseRows(buf, upload.originalName || upload.filename, upload.mimeType || undefined);
      } else if (upload.path) {
        const filePath = path.join(process.cwd(), 'public', upload.path.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          const buf = await fs.promises.readFile(filePath);
          rows = parseRows(buf, upload.originalName || upload.filename, upload.mimeType || undefined);
        }
      }
    } catch (e) {
      console.warn('Admin import - failed to re-parse full file, will fall back to preview', e);
      rows = [];
    }
    if (!rows.length) {
      rows = Array.isArray(upload.preview) ? (upload.preview as unknown[]) : [];
      usedPreviewFallback = true;
    }

    const results: {
      created: Array<{ sku: string; id: string }>;
      errors: Array<{ row: number; reason: string }>;
      note?: string;
    } = { created: [], errors: [] };

    for (const [i, r] of rows.entries()) {
      // Template columns: sku,name,description,price,pricePerBaseQuantity,stockQty,categorySlug
      const row = r as Record<string, unknown>;
      const sku = String(row.sku ?? row.SKU ?? '').trim();
      const name = String(row.name ?? row.Name ?? '').trim();
      const price = parseNumber(row.price ?? row.Price ?? row.pricePerBaseQuantity);
      const stockQty = Math.trunc(parseNumber(row.stockQty ?? row.stock ?? row.Stock));
      const description = String(row.description ?? row.Description ?? '').trim();

      if (!sku || !name) {
        results.errors.push({ row: i, reason: 'Missing sku or name' });
        continue;
      }

      // categoryId is optional — resolve by slug when a category column is present.
      let categoryId: string | undefined;
      const categorySlug = String(row.categorySlug ?? row.category ?? '').trim();
      if (categorySlug) {
        try {
          const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
          if (cat) categoryId = cat.id;
        } catch {
          // ignore category lookup failures; category stays unset
        }
      }

      try {
        const slug = slugify(`${name} ${sku}`) || slugify(sku) || sku;
        const product = await prisma.product.create({
          data: {
            name,
            sku,
            slug,
            description: description || null,
            price,
            stockQty: stockQty || 0,
            supplierId: upload.supplierId,
            ...(categoryId ? { categoryId } : {}),
          },
        });
        results.created.push({ sku, id: product.id });
      } catch (err) {
        results.errors.push({ row: i, reason: err instanceof Error ? err.message : 'Save error' });
      }
    }

    if (usedPreviewFallback) {
      results.note = 'Original file was unavailable; imported from the stored 20-row preview only. Re-upload the file to import all rows.';
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Admin import error', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
});
