import Link from "next/link";
import ProductGrid from "@/components/products/ProductGrid";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import ProductsFilterBar from "@/components/products/ProductsFilterBar";
import ProductsPagination from "@/components/products/ProductsPagination";
import { Product } from "@/models/product";
import { serverApiFetch } from "@/lib/api/server";

interface ProductPageResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    count: number;
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

  const { products, pagination } = await getProducts(sp.toString());
  const start = products.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = products.length === 0 ? 0 : start + products.length - 1;

  return (
    <main className="bg-background">
      <PremiumPageHeader
        title="Shop the market"
        subtitle="Fresh produce, pantry essentials and everyday favourites for your kitchen."
        eyebrow="FreshPick · Colombo"
      />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <ProductsFilterBar />

        <div className="mt-6 flex items-center justify-between border-b border-border pb-4 text-sm text-muted-foreground">
          <span>{pagination.count} products</span>
          <span>{products.length === 0 ? "No items found" : `Showing ${start}–${end}`}</span>
        </div>
        <div className="mt-8">
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-6 text-center">
              <p className="font-sans text-3xl font-normal text-zinc-950">Nothing matches those filters yet.</p>
              <p className="mx-auto mt-3 max-w-md text-sm font-normal leading-7 text-zinc-500">Try another search or reset the filters to browse all products.</p>
              <Link href="/products" className="mt-6 inline-flex rounded-lg bg-brand-amber px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-brand-amber/85">
                Clear all filters
              </Link>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          {(products.length > 0 || pagination.hasPrev) && (
            <div className="mt-6 flex justify-center border-t border-zinc-200 pt-10 md:mt-8 md:pt-6">
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
    </main>
  );
}
