import { publicPageMetadata } from '@/lib/publicPages';
export const metadata = publicPageMetadata('/deals');
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import ProductGrid from "@/components/products/ProductGrid";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import { Product } from "@/models/product";

export const revalidate = 300;

const getDealProducts = unstable_cache(async () => {
  const products = await prisma.product.findMany({
    where: { archived: false, discountPercentage: { gt: 0 } },
    orderBy: [{ discountPercentage: "desc" }, { createdAt: "desc" }],
    select: productCardSelect,
    take: 60,
  });
  return products.map((product) => serializeProductCardForUi(product) as Product);
}, ["deal-products-v3"], { revalidate: 300, tags: ["products"] });

export default async function DealsPage() {
  const dealProducts = await getDealProducts();

  return (
    <div className="min-h-screen bg-background pb-10 text-foreground">
      <section className="border-b border-brand-green/10 bg-brand-cream px-5 pb-14 pt-12 text-foreground md:px-8 md:pb-16 md:pt-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold normal-case text-brand-green"><Tag className="h-3.5 w-3.5" /> Market edit</span>
            <h1 className="mt-5 max-w-4xl font-heading text-[clamp(2.75rem,5vw,5.5rem)] font-semibold leading-[1.05] tracking-[-.05em] text-brand-green-deep">Good food, better timing.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">Current catalogue items with a live discount—kept simple, without turning FreshPick into a permanent red-sale banner.</p>
          </div>
          <Link href="/products" className="editorial-button w-fit">Full market <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
        {dealProducts.length === 0 ? (
          <section className="editorial-card p-10 text-center md:p-14">
            <h2 className="font-serif text-2xl font-normal">No live offers right now.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-normal leading-7 text-muted-foreground">The market is still open—this page only shows products that currently carry a real catalogue discount.</p>
            <Link href="/products" className="editorial-button mt-7">Browse Market</Link>
          </section>
        ) : (
          <section>
            <div className="mb-7 flex items-end justify-between gap-5 border-b border-border pb-5">
              <div>
                <p className="text-xs font-bold normal-case text-brand-green">Live now</p>
                <h2 className="mt-2 font-serif text-3xl font-normal">{dealProducts.length} discounted item{dealProducts.length === 1 ? '' : 's'}</h2>
              </div>
              <span className="text-xs font-normal text-muted-foreground">Prices come from the live catalogue</span>
            </div>
            <ProductGrid products={dealProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
