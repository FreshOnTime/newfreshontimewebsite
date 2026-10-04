import { catalogueMetadata } from '@/lib/seo';
import { SITE_URL, absoluteUrl } from '@/lib/config/site';
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, ShoppingBasket } from "lucide-react";
import { unstable_cache } from "next/cache";
import ProductGrid from "@/components/products/ProductGrid";
import ProductsPagination from "@/components/products/ProductsPagination";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { Product } from "@/models/product";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';
import { getCategoryImage } from '@/lib/categoryImage';

export const revalidate = 300;


const getCategoryBySlug = unstable_cache(async (slug: string) => {
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat || !cat.isActive) return null;
  return {
    id: cat.id,
    name: cat.name || slug,
    slug: cat.slug || slug,
    description: cat.description || null,
    imageUrl: cat.imageUrl || null,
  };
}, ['category-by-slug-v3'], { revalidate: 300, tags: ['products'] });

const PAGE_SIZE = 24;
const getCategoryProducts = unstable_cache(async (categoryId: string, page: number): Promise<{ products: Product[]; total: number; hasNext: boolean; unavailable?: boolean }> => {
  try {
    const where = { categoryId, archived: false };
    const [raw, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: productCardSelect, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE + 1 }),
      prisma.product.count({ where }),
    ]);
    return { products: raw.slice(0, PAGE_SIZE).map((p) => serializeProductCardForUi(p) as Product), total, hasNext: raw.length > PAGE_SIZE };
  } catch (err) {
    console.error('Failed to get category products by slug:', err);
    throw err;
  }
}, ['category-products-v3'], { revalidate: 300, tags: ['products'] });

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found', robots: { index: false, follow: false } };
  return catalogueMetadata(`/categories/${encodeURIComponent(category.slug)}`, category.name, category.description || `Browse ${category.name.toLowerCase()} in the FreshPick market.`, query);
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const requestedPage = Number(query.page);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100000 ? requestedPage : 1;
  const name = category.name;
  const [{ products, total, hasNext, unavailable }, relatedCategories] = await Promise.all([
    getCategoryProducts(category.id, page),
    prisma.category.findMany({ where: { isActive: true, id: { not: category.id } }, select: { name: true, slug: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], take: 5 }).catch(() => []),
  ]);
  const categoryImage = getCategoryImage(category.slug, category.imageUrl);

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Categories', url: `${SITE_URL}/categories` },
    { name, url: absoluteUrl(`/categories/${encodeURIComponent(slug)}`) },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 pt-6 text-xs text-muted-foreground md:px-8"><Link href="/" className="inline-flex min-h-9 items-center hover:text-brand-green">Home</Link><ChevronRight className="h-3 w-3" aria-hidden="true" /><Link href="/categories" className="inline-flex min-h-9 items-center hover:text-brand-green">Categories</Link><ChevronRight className="h-3 w-3" aria-hidden="true" /><span aria-current="page">{name}</span></nav>
      <PremiumPageHeader
        title={name}
        subtitle={category.description || `Explore our fresh selection of ${name.toLowerCase()}.`}
        imageLayout="compact" backgroundImage={categoryImage.split('?')[0].endsWith('.svg') ? null : categoryImage}
      />
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-sm"><p className="text-muted-foreground">{unavailable ? "Selection temporarily unavailable" : `${total} ${total === 1 ? 'product' : 'products'}`}</p><Link href="/categories" className="inline-flex min-h-11 items-center gap-2 text-brand-green hover:underline">All categories <ArrowRight strokeWidth={1.75} className="h-4 w-4" aria-hidden="true" /></Link></div>
        {products.length > 0 && <ProductGrid products={products} />}

        {products.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBasket strokeWidth={1.5} aria-hidden="true" className="mx-auto mb-5 h-9 w-9 text-brand-green" />
            <h2 className="text-2xl font-normal text-brand-green">{unavailable ? 'We couldn’t load this selection.' : page > 1 ? 'You’ve reached the end of this selection.' : 'Fresh arrivals are on their way.'}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{unavailable ? 'Please try again in a moment, or browse the full market.' : 'Explore the rest of the market for your everyday essentials.'}</p>
            <div className="mt-6">
              <Link href="/products" className="inline-flex min-h-11 items-center rounded-lg bg-brand-leaf px-6 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-leaf/85">Shop the market</Link>
            </div>
          </div>
        )}
        {!unavailable && (hasNext || page > 1) && <div className="mt-8 border-t border-border pt-6"><ProductsPagination page={page} limit={PAGE_SIZE} currentCount={products.length} hasPrev={page > 1} hasNext={hasNext} /></div>}
        {relatedCategories.length > 0 && <section className="mt-14 border-t border-border pt-8" aria-labelledby="related-categories-title"><h2 id="related-categories-title" className="font-serif text-2xl text-brand-green">Explore more of the market.</h2><nav aria-label="Related categories" className="mt-5 flex flex-wrap gap-6">{relatedCategories.map(item => <Link key={item.slug} href={`/categories/${encodeURIComponent(item.slug)}`} className="editorial-link">{item.name}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>)}</nav></section>}
      </div>
    </>
  );
}
