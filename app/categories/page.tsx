"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Grid2X2, Sparkles } from "lucide-react";
import { useLocalStorageCache, CACHE_TTL } from "@/lib/hooks/useLocalStorageCache";

type Cat = { name: string; slug: string; description?: string | null; imageUrl?: string | null };

export default function CategoriesIndex() {
  const { data: cats, isLoading } = useLocalStorageCache<Cat[]>(
    "categories_list_v2",
    async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) return [];
      const json = await res.json();
      const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
      return items
        .map((c) => {
          if (typeof c === 'object' && c && 'name' in c && 'slug' in c) {
            const cc = c as { name?: unknown; slug?: unknown; description?: unknown; imageUrl?: unknown };
            return {
              name: String(cc.name ?? ''),
              slug: String(cc.slug ?? ''),
              description: typeof cc.description === 'string' ? cc.description : null,
              imageUrl: typeof cc.imageUrl === 'string' ? cc.imageUrl : null,
            };
          }
          return { name: '', slug: '', description: null, imageUrl: null };
        })
        .filter((c) => c.name && c.slug);
    },
    { ttl: CACHE_TTL.LONG }
  );

  const categories = cats || [];
  const featuredCollections = categories.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#09090b]">
      <section className="relative flex h-[80vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bgs/home-hero.jpg"
            alt="FreshPick collections"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-white/10" />
        </div>
        <div className="container relative z-10 mx-auto max-w-5xl px-4 pt-20 text-center text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            The FreshPick Collection
          </div>
          <h1 className="mb-8 font-serif text-6xl leading-[0.9] tracking-tight text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
            Our <span className="italic text-emerald-100">Collections</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-zinc-100 drop-shadow-md md:text-2xl">
            Browse thoughtfully selected favourites for every kitchen, occasion, and delivery day.
          </p>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-80"><div className="h-16 w-px bg-gradient-to-b from-transparent via-white to-transparent" /></div>
      </section>

      <section className="relative bg-[#ffffff] py-24 md:py-32">
      <div className="container relative z-20 mx-auto -mt-32 max-w-[1400px] px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="min-h-[340px] animate-pulse bg-white" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {featuredCollections.map((category, index) => {
              const isFeatured = index === 1;
              return (
                <Link key={category.slug} href={`/categories/${category.slug}`} className={`relative flex min-h-[340px] flex-col overflow-hidden border border-[#e4e4e7] p-8 text-center transition-all duration-500 md:p-10 ${isFeatured ? "z-20 bg-[#09090b] text-white shadow-2xl lg:-mt-4 lg:-mb-4" : "z-10 bg-white text-[#09090b] hover:-translate-y-1 hover:shadow-xl"}`}>
                  {isFeatured && <span className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />}
                  <span className={`mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full text-sm font-serif ${isFeatured ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-800"}`}>0{index + 1}</span>
                  <h2 className="font-serif text-3xl">{category.name}</h2>
                  <p className={`mx-auto mt-4 max-w-[240px] text-sm font-light leading-relaxed ${isFeatured ? "text-zinc-400" : "text-zinc-500"}`}>{category.description || `Discover our premium ${category.name.toLowerCase()} selection.`}</p>
                  <div className={`my-7 border-t ${isFeatured ? "border-white/10" : "border-zinc-100"}`} />
                  <span className={`text-xs uppercase tracking-[0.16em] ${isFeatured ? "text-zinc-500" : "text-zinc-400"}`}>FreshPick collection</span>
                  <span className={`mt-auto inline-flex h-12 items-center justify-center text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${isFeatured ? "bg-[#d1fae5] text-[#09090b] hover:bg-white" : "bg-[#09090b] text-white hover:bg-emerald-900"}`}>Explore collection</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-24 border border-[#e4e4e7] bg-white p-6 shadow-[0_24px_70px_rgba(20,32,25,0.07)] md:p-10">
          <div className="mb-10 flex flex-col gap-4 border-b border-zinc-100 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Browse by collection</span>
              <h2 className="font-serif text-4xl text-zinc-900 md:text-5xl">Find your favourites</h2>
            </div>
            {!isLoading && (
              <div className="flex items-center gap-2 text-sm font-light text-zinc-500">
                <Grid2X2 className="h-4 w-4 text-emerald-700" />
                {categories.length} {categories.length === 1 ? "collection" : "collections"}
              </div>
            )}
          </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[4/3] bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden bg-black p-8 text-left transition-all duration-500 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-[0_22px_55px_rgba(5,150,105,0.24)] md:min-h-[380px] md:p-10"
              >
                <div className="relative z-10">
                  <span className="mb-6 block w-12 border-t border-white/60 transition-all duration-500 group-hover:w-20" />
                  <h3 className="font-serif text-4xl font-medium leading-none tracking-tight text-white md:text-5xl">{c.name}</h3>
                  <p className="mt-4 line-clamp-2 max-w-sm text-base font-light leading-relaxed text-white/70">
                    {c.description || `Discover FreshPick ${c.name.toLowerCase()} favourites.`}
                  </p>
                  <div className="mt-7 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                    Explore collection <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-zinc-400 font-serif">No categories found.</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      </section>
    </div>
  );
}
