import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

function parseNumber(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseRows(buffer: Buffer, name: string, mimeType?: string): unknown[] {
  const lowerName = (name || '').toLowerCase();
  const mt = mimeType || '';
  const isCsv = mt === 'text/csv' || lowerName.endsWith('.csv');
  const isExcel = mt.includes('spreadsheet') || mt.includes('excel') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
  if (isCsv) {
    const text = buffer.toString('utf8');
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: header => header.trim(),
      comments: '#',
    });
    return parsed.data as unknown[];
  }
  if (isExcel) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    if (!wb.SheetNames?.length) return [];
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as unknown[];
  }
  return [];
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean);
  return Array.from(new Set(String(value ?? '').split(/[,;|]+/).map(v => v.trim()).filter(Boolean))).slice(0, 30);
}

function safeImage(value: unknown): { url: string | null; warning?: string } {
  const raw = String(value ?? '').trim();
  if (!raw) return { url: null };
  if (raw.startsWith('/') && !raw.startsWith('//')) return { url: raw };
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return { url: null, warning: 'imageUrl must use HTTPS' };
    const host = url.hostname.toLowerCase();
    const supported =
      host.endsWith('.blob.core.windows.net') ||
      host === 'images.unsplash.com' ||
      host === 'plus.unsplash.com' ||
      host === 'lh3.googleusercontent.com' ||
      host.endsWith('.googleusercontent.com');
    return supported
      ? { url: url.href }
      : { url: null, warning: 'imageUrl host is not supported by FreshPick; the product was imported without that image' };
  } catch {
    return { url: null, warning: 'imageUrl is invalid; the product was imported without that image' };
  }
}

const units = new Set(['g','kg','ml','l','ea','lb']);

export const POST = requireAdmin(async (request: NextRequest & { user?: { role?: string; userId?: string } }) => {
  try {
    const body = await request.json();
    const uploadId = body?.uploadId;
    if (!uploadId) return NextResponse.json({ error: 'uploadId required' }, { status: 400 });

    const upload = await prisma.supplierUpload.findUnique({ where: { id: uploadId } });
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    let rows: unknown[] = [];
    let usedPreviewFallback = false;
    try {
      if (upload.fileData) {
        rows = parseRows(Buffer.from(upload.fileData, 'base64'), upload.originalName || upload.filename, upload.mimeType || undefined);
      } else if (upload.path) {
        const publicRoot = path.resolve(process.cwd(), 'public');
        const candidate = path.resolve(publicRoot, upload.path.replace(/^\/+/, ''));
        if (candidate.startsWith(publicRoot + path.sep) && fs.existsSync(candidate)) {
          rows = parseRows(await fs.promises.readFile(candidate), upload.originalName || upload.filename, upload.mimeType || undefined);
        }
      }
    } catch (error) {
      console.warn('Admin import - failed to re-parse full file, falling back to preview', error);
      rows = [];
    }

    if (!rows.length) {
      rows = Array.isArray(upload.preview) ? (upload.preview as unknown[]) : [];
      usedPreviewFallback = true;
    }

    const results: {
      created: Array<{ sku: string; id: string }>;
      updated: Array<{ sku: string; id: string }>;
      errors: Array<{ row: number; reason: string }>;
      warnings: Array<{ row: number; reason: string }>;
      note?: string;
    } = { created: [], updated: [], errors: [], warnings: [] };

    for (const [i, raw] of rows.entries()) {
      const row = raw as Record<string, unknown>;
      const sku = String(row.sku ?? row.SKU ?? '').trim().toUpperCase();
      const name = String(row.name ?? row.Name ?? '').trim();
      const description = String(row.description ?? row.Description ?? '').trim();
      const rawPrice = row.price ?? row.Price ?? row.pricePerBaseQuantity;
      const price = parseNumber(rawPrice);
      const costPrice = parseNumber(row.costPrice ?? row.CostPrice);
      const stockQty = Math.max(0, Math.trunc(parseNumber(row.stockQty ?? row.stock ?? row.Stock)));
      const minStockLevel = Math.max(0, Math.trunc(parseNumber(row.minStockLevel ?? row.minimumStock ?? 5)));
      const categorySlug = String(row.categorySlug ?? row.category ?? '').trim();
      const tags = parseTags(row.tags ?? row.Tags);
      const supplierSku = String(row.supplierSku ?? '').trim();
      const unit = String(row.unit ?? row.measurementUnit ?? '').trim().toLowerCase();
      const unitQuantity = parseNumber(row.unitQuantity ?? row.baseMeasurementQuantity);
      const unitPrice = parseNumber(row.unitPrice ?? row.pricePerBaseQuantity ?? price);
      const imageResult = safeImage(row.imageUrl ?? row.image);
      const image = imageResult.url;

      if (!sku || !name) {
        results.errors.push({ row: i + 2, reason: 'Missing sku or name' });
        continue;
      }
      if (rawPrice === null || rawPrice === undefined || String(rawPrice).trim() === '') {
        results.errors.push({ row: i + 2, reason: 'Missing price' });
        continue;
      }
      if (price < 0) {
        results.errors.push({ row: i + 2, reason: 'Price cannot be negative' });
        continue;
      }

      let categoryId: string | undefined;
      if (categorySlug) {
        const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
        if (!category) {
          results.errors.push({ row: i + 2, reason: `Unknown categorySlug: ${categorySlug}` });
          continue;
        }
        categoryId = category.id;
      }

      if (imageResult.warning) {
        results.warnings.push({ row: i + 2, reason: imageResult.warning });
      }

      const attributes: Record<string, unknown> = {};
      if (supplierSku) attributes.supplierSku = supplierSku;
      if (unit) {
        if (!units.has(unit) || unitQuantity <= 0) {
          results.errors.push({ row: i + 2, reason: 'unit must be g, kg, ml, l, ea or lb and unitQuantity must be greater than 0' });
          continue;
        }
        attributes.unitOptions = [{
          label: `${unitQuantity}${unit}`,
          quantity: unitQuantity,
          unit,
          price: unitPrice >= 0 ? unitPrice : price,
        }];
      }

      try {
        const existing = await prisma.product.findUnique({
          where: { sku },
          select: { id: true, supplierId: true },
        });

        if (existing && existing.supplierId && existing.supplierId !== upload.supplierId) {
          results.errors.push({ row: i + 2, reason: `SKU ${sku} already belongs to another supplier` });
          continue;
        }

        const data: Prisma.ProductUncheckedUpdateInput = {
          name,
          description: description || null,
          price,
          costPrice,
          stockQty,
          minStockLevel,
          supplierId: upload.supplierId,
          ...(categoryId ? { categoryId } : {}),
          tags,
          attributes: attributes as Prisma.InputJsonValue,
          ...(image ? { image, images: [image] } : {}),
          archived: false,
        };

        if (existing) {
          const product = await prisma.product.update({ where: { id: existing.id }, data });
          results.updated.push({ sku, id: product.id });
        } else {
          const slug = slugify(`${name} ${sku}`) || slugify(sku) || sku.toLowerCase();
          const product = await prisma.product.create({
            data: {
              ...data,
              sku,
              slug,
            } as Prisma.ProductUncheckedCreateInput,
          });
          results.created.push({ sku, id: product.id });
        }
      } catch (error) {
        results.errors.push({ row: i + 2, reason: error instanceof Error ? error.message : 'Save error' });
      }
    }

    if (results.created.length || results.updated.length) {
      revalidateTag('products', 'max');

      try {
        const supplierAccounts = await prisma.user.findMany({
          where: { supplierId: upload.supplierId, isBanned: false },
          select: { id: true },
        });
        if (supplierAccounts.length) {
          const changedCount = results.created.length + results.updated.length;
          await prisma.notification.createMany({
            data: supplierAccounts.map(account => ({
              id: randomUUID(),
              title: 'Catalogue import completed',
              message: `${changedCount} product${changedCount === 1 ? '' : 's'} from ${upload.originalName || upload.filename} ${changedCount === 1 ? 'is' : 'are'} now in your FreshPick product list.`,
              type: 'success' as const,
              targetUserId: account.id,
              link: '/dashboard',
            })),
          });
        }
      } catch (notificationError) {
        console.error('Supplier catalogue import notification failed', notificationError);
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
