import Link from "next/link";
import { unstable_cache } from "next/cache";
import { ArrowRight, Search } from "lucide-react";
import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import ProductGrid from "@/components/products/ProductGrid";
import { Product } from "@/models/product";
import { privateMetadata } from '@/lib/seo';

export const metadata = { ...privateMetadata, title: { absolute: 'Search FreshPick' } };

const searchProducts = unstable_cache(async (query: string) => {
  if (!query.trim()) return [];
  const products = await prisma.product.findMany({
    where: {
      archived: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
        { category: { is: { isActive: true, name: { contains: query, mode: "insensitive" } } } },
      ],
    },
    select: productCardSelect,
    orderBy: [{ stockQty: "desc" }, { createdAt: "desc" }],
    take: 40,
  });
  return products.map((product) => serializeProductCardForUi(product) as Product);
}, ["storefront-search-v4"], { revalidate: 180, tags: ["products", "categories"] });

const searchCategories = unstable_cache(async (query: string) => {
  if (!query.trim()) return [];
  return prisma.category.findMany({
    where: { isActive: true, OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] },
    select: { name: true, slug: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 12,
  });
}, ["category-search-v1"], { revalidate: 180, tags: ["categories"] });

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = (getString(params.q) || "").trim();
  const [products, categories] = query ? await Promise.all([searchProducts(query), searchCategories(query)]) : [[], []];
  const total = products.length + categories.length;

  return (
    <div className="bg-background pb-10 text-foreground">
      <section className="border-b border-border bg-card px-5 py-10 md:px-8 md:py-6">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Search FreshPick</span>
          <h1 className="mt-4 max-w-4xl font-serif text-3xl font-normal leading-tight tracking-[-0.035em] text-brand-green md:text-4xl">
            {query ? <>Results for <span className="not-italic text-brand-green">“{query}”</span></> : <>What are you <span className="not-italic text-brand-green">looking for?</span></>}
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-normal leading-7 text-muted-foreground">
            Find food, drinks and categories in one search.
          </p>

          <form action="/search" className="mt-8 max-w-2xl">
            <div className="flex h-14 items-center rounded-lg border border-border bg-background px-5 transition-colors focus-within:border-primary focus-within:bg-card">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input aria-label="Search FreshPick products" name="q" defaultValue={query} autoFocus={!query} placeholder="Try dinner, mango, pasta, tea…" className="ml-3 min-w-0 flex-1 bg-transparent text-base font-normal outline-none placeholder:text-muted-foreground" />
              <button type="submit" className="ml-3 rounded-lg bg-brand-leaf px-5 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-leaf/85">Search</button>
            </div>
          </form>

          {query && <p className="mt-4 text-xs text-muted-foreground">{total} result{total === 1 ? '' : 's'} across the market and kitchen</p>}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-8">
        {!query ? (
          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["Food for your table", "Browse the market by category.", "/categories"],
              ["Just browsing?", "Open Discover for moods, makers and ready food.", "/discover"],
              ["Know the list?", "Go straight to the live market and its filters.", "/products"],
            ].map(([title, copy, href]) => (
              <Link key={href} href={href} className="group border-t border-border py-5 transition-colors">
                <h2 className="text-xl font-normal text-brand-green">{title}</h2>
                <p className="mt-3 text-sm font-normal leading-6 text-muted-foreground">{copy}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-brand-green">Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </section>
        ) : total === 0 ? (
          <section className="rounded-lg border border-border bg-card p-10 text-center md:p-16">
            <h2 className="font-serif text-2xl font-normal text-foreground">Nothing exact yet.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-normal leading-7 text-muted-foreground">Try a broader food name or move into Discover, where you can start from a craving or meal instead of a product keyword.</p>
            <Link href="/discover" className="mt-7 inline-flex rounded-lg bg-brand-leaf px-6 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-leaf/85">Open Discover</Link>
          </section>
        ) : (
          <div className="space-y-16">
            {categories.length > 0 && <section aria-labelledby="search-categories-title"><h2 id="search-categories-title" className="font-serif text-2xl text-brand-green">Categories</h2><nav aria-label="Matching categories" className="mt-5 flex flex-wrap gap-4">{categories.map(category => <Link key={category.slug} href={`/categories/${encodeURIComponent(category.slug)}`} className="editorial-link">{category.name}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>)}</nav></section>}
            {products.length > 0 && (
              <section>
                <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">From the market</p>
                    <h2 className="mt-2 font-serif text-2xl font-normal text-foreground">Products</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{products.length} matched</span>
                </div>
                <div className="mt-7"><ProductGrid products={products} /></div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
