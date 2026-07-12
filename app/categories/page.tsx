"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Grid2X2, Sparkles } from "lucide-react";
import { useLocalStorageCache, CACHE_TTL } from "@/lib/hooks/useLocalStorageCache";

type Cat = { name: string; slug: string; description?: string | null; imageUrl?: string | null };

export default function CategoriesIndex() {
  const { data: cats, isLoading } = useLocalStorageCache<Cat[]>(
    "categories_list",
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
    <div className="min-h-screen bg-[#faf8f3] text-[#142019]">
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
            <Sparkles className="h-4 w-4 text-amber-400" />
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

      <section className="relative bg-[#faf8f3] py-24 md:py-32">
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
                <Link key={category.slug} href={`/categories/${category.slug}`} className={`relative flex min-h-[340px] flex-col overflow-hidden border border-[#e2ddd3] p-8 text-center transition-all duration-500 md:p-10 ${isFeatured ? "z-20 bg-[#142019] text-white shadow-2xl lg:-mt-4 lg:-mb-4" : "z-10 bg-white text-[#142019] hover:-translate-y-1 hover:shadow-xl"}`}>
                  {isFeatured && <span className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />}
                  <span className={`mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full text-sm font-serif ${isFeatured ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-800"}`}>0{index + 1}</span>
                  <h2 className="font-serif text-3xl">{category.name}</h2>
                  <p className={`mx-auto mt-4 max-w-[240px] text-sm font-light leading-relaxed ${isFeatured ? "text-zinc-400" : "text-zinc-500"}`}>{category.description || `Discover our premium ${category.name.toLowerCase()} selection.`}</p>
                  <div className={`my-7 border-t ${isFeatured ? "border-white/10" : "border-zinc-100"}`} />
                  <span className={`text-xs uppercase tracking-[0.16em] ${isFeatured ? "text-zinc-500" : "text-zinc-400"}`}>FreshPick collection</span>
                  <span className={`mt-auto inline-flex h-12 items-center justify-center text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${isFeatured ? "bg-[#f0dfb6] text-[#142019] hover:bg-white" : "bg-[#142019] text-white hover:bg-emerald-900"}`}>Explore collection</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-24 border border-[#e2ddd3] bg-white p-6 shadow-[0_24px_70px_rgba(20,32,25,0.07)] md:p-10">
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
                className="group relative aspect-[4/3] overflow-hidden bg-emerald-900"
              >
                {c.imageUrl ? (
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(110,231,183,0.35),transparent_28%),radial-gradient(circle_at_85%_85%,rgba(45,212,191,0.28),transparent_30%),linear-gradient(135deg,#047857,#115e59)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/45 to-emerald-950/10 transition-colors duration-300 group-hover:from-emerald-950/95" />

                <div className="absolute inset-0 flex flex-col justify-end p-7 text-left md:p-8">
                  <span className="mb-4 w-12 border-t border-lime-200/70 transition-all duration-500 group-hover:w-20" />
                  <h3 className="font-serif text-3xl text-white md:text-4xl">{c.name}</h3>
                  <p className="mt-2 line-clamp-2 max-w-sm text-sm font-light leading-relaxed text-emerald-50/85">
                    {c.description || `Discover FreshPick ${c.name.toLowerCase()} favourites.`}
                  </p>
                  <div className="mt-5 inline-flex items-center text-xs font-bold uppercase tracking-[0.18em] text-lime-200">
                    Explore collection <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
