import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ProductImage from "@/components/products/ProductImage";
import type { Product } from "@/models/product";

export default function HeroSection({ product }: { product?: Product }) {
  return (
    <section aria-labelledby="home-title" className="bg-background">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12 md:px-8 md:py-10 lg:gap-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-green">FreshPick · Colombo</p>
          <h1 id="home-title" className="mt-5 text-[2.75rem] font-medium leading-[1.06] tracking-[-0.045em] text-brand-green md:text-5xl lg:text-[3.75rem]">
            Good food.<br />Every day.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-muted-foreground">Fresh groceries, local favourites and a little inspiration for your next meal.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 md:mt-7 md:gap-x-6">
            <Link href="/products" className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-brand-amber px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-brand-amber/85 md:gap-5 md:px-5">
              Shop the market <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/homemade" className="inline-flex min-h-12 items-center gap-2 text-sm font-medium text-brand-green underline-offset-4 hover:underline">
              Local makers <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {product ? (
          <Link href={`/products/${product.sku}`} prefetch={false} className="group grid grid-cols-[6rem_1fr] items-center gap-5 border-t border-border py-4 md:grid-cols-1 md:gap-0 md:border-b md:border-t-0 md:py-0">
            <div className="relative aspect-square overflow-hidden rounded-lg [&_img]:mix-blend-multiply md:mx-auto md:w-full md:max-w-[14rem]">
              <ProductImage src={product.image.url} alt={product.name} priority />
            </div>
            <div className="flex items-center justify-between gap-4 md:pb-4 md:pt-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">At the market</p>
                <h2 className="mt-1 text-lg font-medium tracking-tight text-brand-green group-hover:underline md:text-xl">{product.name}</h2>
                {product.category?.name && <p className="mt-1 text-sm text-muted-foreground">{product.category.name}</p>}
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
            </div>
          </Link>
        ) : (
          <div className="border-y border-border py-6 md:py-10">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Make it a regular thing</p>
            <h2 className="mt-3 text-2xl font-medium text-brand-green">Your weekly basket.</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Explore recurring baskets for the food you come back to.</p>
            <Link href="/subscriptions" className="mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-brand-green hover:underline">Explore baskets <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        )}
      </div>
    </section>
  );
}
