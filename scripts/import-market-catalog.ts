/** Safe reference-catalogue importer. Defaults to DRY RUN. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';

interface CatalogueRow {
  sku: string; name: string; slug: string; categorySlug: string;
  benchmarkPriceLkr: number; market: string; observedOn: string;
  sourceUrl: string; pack: string; tags: string[];
}
const FILE = resolve(process.cwd(), 'data/market-catalog-2026-11-05.json');
const CATEGORIES: Record<string, string> = {
  'fresh-produce': 'Fresh Produce', 'pantry-staples': 'Pantry Staples', 'dairy-eggs': 'Dairy & Eggs',
};
const SOURCE_HOSTS = new Set(['welandapola.com', 'www.welandapola.com', 'sattrin.com']);

function validate(): CatalogueRow[] {
  const input: unknown = JSON.parse(readFileSync(FILE, 'utf8'));
  if (!Array.isArray(input) || !input.length) throw new Error('Expected nonempty catalogue array');
  const skus = new Set<string>(), slugs = new Set<string>();
  return input.map((value, i) => {
    const item = value as CatalogueRow;
    if (!item || typeof item !== 'object' ||
        typeof item.sku !== 'string' || !/^FP-MKT-[A-Z0-9-]+$/.test(item.sku) ||
        typeof item.slug !== 'string' || !/^fp-market-[a-z0-9-]+$/.test(item.slug) ||
        typeof item.name !== 'string' || item.name.length < 3 || item.name.length > 200 ||
        !Object.prototype.hasOwnProperty.call(CATEGORIES, item.categorySlug) ||
        !Number.isFinite(item.benchmarkPriceLkr) || item.benchmarkPriceLkr <= 0 ||
        item.benchmarkPriceLkr > 100000 || typeof item.market !== 'string' || !item.market.trim() ||
        typeof item.observedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.observedOn) ||
        typeof item.pack !== 'string' || !item.pack ||
        !Array.isArray(item.tags) || !item.tags.every(tag => typeof tag === 'string')) {
      throw new Error('Invalid catalogue entry at index ' + i);
    }
    let url: URL;
    try { url = new URL(item.sourceUrl); } catch { throw new Error('Invalid source URL: ' + item.sku); }
    if (url.protocol !== 'https:' || !SOURCE_HOSTS.has(url.hostname)) {
      throw new Error('Unapproved source URL: ' + item.sku);
    }
    if (skus.has(item.sku) || slugs.has(item.slug)) throw new Error('Duplicate SKU or slug: ' + item.sku);
    skus.add(item.sku); slugs.add(item.slug);
    return item;
  });
}

async function main() {
  const rows = validate();
  const args = new Set(process.argv.slice(2));
  if (args.has('--publish')) throw new Error('Publishing via importer is intentionally unsupported.');
  if (!args.has('--apply')) {
    console.log('DRY RUN: ' + rows.length + ' records validated. Database NOT accessed.');
    for (const row of rows) console.log(row.sku + ' | ' + row.name + ' | benchmark LKR ' + row.benchmarkPriceLkr);
    console.log('Use --apply to stage as archived and out of stock.');
    return;
  }
  if (process.env.NODE_ENV === 'production' && !args.has('--allow-production')) {
    throw new Error('Production import requires --allow-production as well as --apply.');
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const prisma = new PrismaClient();
  try {
    const counts = await prisma.$transaction(async tx => {
      const categories = new Map<string, string>();
      for (const slug of new Set(rows.map(row => row.categorySlug))) {
        const c = await tx.category.upsert({
          where: { slug }, update: {}, create: { slug, name: CATEGORIES[slug], isActive: true },
        });
        categories.set(slug, c.id);
      }
      let created = 0, skipped = 0;
      for (const row of rows) {
        if (await tx.product.findUnique({ where: { sku: row.sku }, select: { id: true } })) {
          skipped++; continue;
        }
        await tx.product.create({
          data: {
            sku: row.sku, slug: row.slug, name: row.name,
            description: row.name + '. Pack: ' + row.pack + '. Supply and pricing require review.',
            price: new Prisma.Decimal(row.benchmarkPriceLkr),
            costPrice: new Prisma.Decimal(0),
            categoryId: categories.get(row.categorySlug)!,
            supplierId: null, stockQty: 0, minStockLevel: 5, archived: true,
            isFeatured: false, isBundle: false, discountPercentage: new Prisma.Decimal(0),
            image: null, images: [], tags: row.tags,
            attributes: {
              pack: row.pack, importedFrom: 'market-catalog-2026-11-05',
              priceStatus: 'third_party_benchmark_unapproved', supplierStatus: 'unverified',
              imageStatus: 'unverified', stockStatus: 'not_counted',
              sourceMarket: row.market, sourceObservedOn: row.observedOn, sourceUrl: row.sourceUrl,
            } as Prisma.InputJsonValue,
          },
        });
        created++;
      }
      return { created, skipped };
    }, { timeout: 60000, maxWait: 15000 });
    console.log('Catalogue staged:', counts.created, 'created;', counts.skipped, 'SKUs skipped.');
    console.log('All additions are archived, out of stock, supplier unassigned.');
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
