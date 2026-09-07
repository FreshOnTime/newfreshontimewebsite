import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import ProductGrid from "@/components/products/ProductGrid";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import { Product } from "@/models/product";

export const revalidate = 300;

const getDealProducts = unstable_cache(async () => {
  try {
    const products = await prisma.product.findMany({
      where: { archived: false, discountPercentage: { gt: 0 } },
      orderBy: [{ discountPercentage: "desc" }, { createdAt: "desc" }],
      select: productCardSelect,
      take: 60,
    });
    return products.map((product) => serializeProductCardForUi(product) as Product);
  } catch (error) {
    console.error('Failed to fetch deal products:', error);
    return [];
  }
}, ["deal-products-v2"], { revalidate: 300, tags: ["products"] });

export default async function DealsPage() {
  const dealProducts = await getDealProducts();

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="border-b border-zinc-200 bg-[#0b1710] px-5 pb-14 pt-28 text-white md:px-8 md:pb-16 md:pt-32">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200"><Tag className="h-3.5 w-3.5" /> Market edit</span>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl font-normal leading-none tracking-[-0.03em] md:text-7xl">Good food, better timing.</h1>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-white/55">Current catalogue items with a live discount—kept simple, without turning FreshPick into a permanent red-sale banner.</p>
          </div>
          <Link href="/products" className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 text-xs font-semibold text-white/80 hover:bg-white/10">Full market <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
        {dealProducts.length === 0 ? (
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center md:p-14">
            <h2 className="font-serif text-4xl font-normal">No live offers right now.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-7 text-zinc-500">The market is still open—this page only shows products that currently carry a real catalogue discount.</p>
            <Link href="/products" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-950">Browse Market</Link>
          </section>
        ) : (
          <section>
            <div className="mb-7 flex items-end justify-between gap-5 border-b border-zinc-300 pb-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">Live now</p>
                <h2 className="mt-2 font-serif text-3xl font-normal">{dealProducts.length} discounted item{dealProducts.length === 1 ? '' : 's'}</h2>
              </div>
              <span className="text-xs font-light text-zinc-400">Prices come from the live catalogue</span>
            </div>
            <ProductGrid products={dealProducts} />
          </section>
        )}
      </div>
    </main>
  );
}
