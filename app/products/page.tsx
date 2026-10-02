import Link from "next/link";
import { ArrowRight, ChevronRight, Search, ShoppingBasket } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import ProductsFilterBar from "@/components/products/ProductsFilterBar";
import ProductsPagination from "@/components/products/ProductsPagination";
import CatalogRetryButton from "@/components/products/CatalogRetryButton";
import { Product } from "@/models/product";
import { serverApiFetch } from "@/lib/api/server";

interface ProductPageResult {
  unavailable?: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    count: number;
    total?: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

async function getProducts(query: string): Promise<ProductPageResult> {
  try {
    const suffix = query ? `?${query}` : "";
    const response = await serverApiFetch(`/api/storefront/products${suffix}`, {
      next: { revalidate: 300, tags: ["products"] },
    } as RequestInit & { next: { revalidate: number; tags: string[] } });

    if (!response.ok) throw new Error(`Product catalog API returned HTTP ${response.status}`);
    return response.json() as Promise<ProductPageResult>;
  } catch (error) {
    console.error("[Products page] Failed to load catalog:", error);
    return {
      unavailable: true,
      products: [],
      pagination: { page: 1, limit: 24, count: 0, hasNext: false, hasPrev: false },
    };
  }
}

export default async function ProductsIndex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const spObj = await searchParams;
  const sp = new URLSearchParams();
  const allowed = ["search", "categoryId", "supplierId", "minPrice", "maxPrice", "inStock", "sort", "page", "limit", "tags"];

  for (const key of allowed) {
    const val = spObj[key];
    if (Array.isArray(val)) {
      if (key === "tags") sp.set(key, val.join(","));
      else for (const v of val) if (v != null) sp.append(key, String(v));
    } else if (val != null) {
      sp.set(key, String(val));
    }
  }

  const { products, pagination, unavailable } = await getProducts(sp.toString());
  const filtered = ["search", "categoryId", "supplierId", "minPrice", "maxPrice", "inStock", "tags"].some((key) => sp.has(key));
  const start = products.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = products.length === 0 ? 0 : start + products.length - 1;

  return (
    <div className="bg-background">
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl items-center gap-2 px-5 pt-6 text-xs text-muted-foreground md:px-8">
        <Link href="/" className="inline-flex min-h-9 items-center hover:text-brand-green">Home</Link><ChevronRight className="h-3 w-3" aria-hidden="true" /><span aria-current="page">The market</span>
      </nav>
      <PremiumPageHeader
        title="Shop the market"
        subtitle="Fresh produce, pantry essentials and everyday favourites for your kitchen."
      />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <ProductsFilterBar />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{unavailable ? "The market is temporarily unavailable" : products.length === 0 ? "No items found" : `Showing ${start}–${end}${pagination.total !== undefined ? ` of ${pagination.total}` : " products"}`}</span>
          <Link href="/categories" className="inline-flex min-h-11 items-center gap-2 text-brand-green hover:underline">Browse categories <ArrowRight strokeWidth={1.75} className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-8">
          {products.length === 0 ? (
            <section className="py-14 text-center md:py-20" aria-labelledby="catalog-empty-title">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-brand-green">{filtered && !unavailable ? <Search strokeWidth={1.5} className="h-7 w-7" aria-hidden="true" /> : <ShoppingBasket strokeWidth={1.5} className="h-7 w-7" aria-hidden="true" />}</div>
              <h2 id="catalog-empty-title" className="mt-6 text-2xl font-normal tracking-tight text-brand-green">{unavailable ? "We couldn’t load the market." : filtered ? "Nothing matches just yet." : "The market is being refreshed."}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">{unavailable ? "Please try again in a moment." : filtered ? "Try a different search or remove a filter to see more of the market." : "Check back soon for fresh groceries and everyday essentials."}</p>
              {unavailable ? <CatalogRetryButton /> : filtered ? <Link href="/products" className="mt-6 inline-flex min-h-11 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary/85">Clear all filters</Link> : <Link href="/categories" className="mt-6 inline-flex min-h-11 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary/85">Browse categories</Link>}
            </section>
          ) : (
            <ProductGrid products={products} />
          )}

          {(pagination.hasNext || pagination.hasPrev) && (
            <div className="mt-8 border-t border-border pt-6">
              <ProductsPagination
                page={pagination.page}
                limit={pagination.limit}
                currentCount={products.length}
                hasPrev={pagination.hasPrev}
                hasNext={pagination.hasNext}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
