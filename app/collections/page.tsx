import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Layers3, Sparkles } from "lucide-react";
import { listPublishedCollections } from "@/lib/collectionService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Food Collections | FreshPick Colombo",
  description: "Curated FreshPick food edits for occasions, cravings and routines — combining shoppable recipes and live products.",
  alternates: { canonical: "https://freshpick.lk/collections" },
};

export default async function CollectionsPage() {
  const collections = await listPublishedCollections(36);

  return (
    <main className="min-h-screen bg-[#f6f7f4]">
      <section className="relative overflow-hidden bg-[#08130d] px-4 pb-24 pt-32 text-white md:px-8 md:pb-32 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(110,231,183,0.14),transparent_28%),radial-gradient(circle_at_85%_55%,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="container relative mx-auto max-w-7xl">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-200">
            <Layers3 className="h-3.5 w-3.5" /> FreshPick edits
          </span>
          <h1 className="max-w-5xl text-balance font-serif text-6xl font-normal leading-[0.9] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[7rem]">
            Food for a reason.<br /><span className="italic text-emerald-200">Curated for the moment.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/65 md:text-lg">
            Dinner edits, weekend tables, seasonal discoveries and routines built from FreshPick recipes and products you can actually buy.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {collections.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {collections.map((collection, index) => (
                <Link key={collection.id} href={`/collections/${collection.slug}`} className={`group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_70px_rgba(10,30,18,0.10)] ${index === 0 ? "md:col-span-2" : ""}`}>
                  <div className={`${index === 0 ? "h-[460px]" : "h-[320px]"} relative bg-[#102017] bg-cover bg-center`} style={collection.featuredImage?.url ? { backgroundImage: `linear-gradient(to top,rgba(7,17,12,.82),rgba(7,17,12,.08)),url("${collection.featuredImage.url.replace(/"/g, "%22")}")` } : undefined}>
                    <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                      <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200">{collection.eyebrow}</span>
                      <h2 className={`mt-4 max-w-2xl font-serif font-normal leading-[1.02] ${index === 0 ? "text-5xl md:text-6xl" : "text-3xl"}`}>{collection.title}</h2>
                    </div>
                  </div>
                  <div className="p-7 md:p-8">
                    <p className="text-sm font-light leading-7 text-zinc-600">{collection.excerpt}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5 text-xs text-zinc-500">
                      <span>{collection.recipeCount} recipes · {collection.productCount} picks</span>
                      <span className="inline-flex items-center gap-2 font-semibold text-emerald-800">Open edit <ArrowUpRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-20 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-emerald-700" />
              <p className="mt-5 font-serif text-3xl text-zinc-950">The first FreshPick edit is being composed.</p>
              <Link href="/recipes" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">Browse recipes <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
