"use client";

import Image from "next/image";
import Link from "next/link";
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
        .map((category) => {
          if (typeof category === 'object' && category && 'name' in category && 'slug' in category) {
            const value = category as { name?: unknown; slug?: unknown; description?: unknown; imageUrl?: unknown };
            return {
              name: String(value.name ?? ''),
              slug: String(value.slug ?? ''),
              description: typeof value.description === 'string' ? value.description : null,
              imageUrl: typeof value.imageUrl === 'string' ? value.imageUrl : null,
            };
          }
          return { name: '', slug: '', description: null, imageUrl: null };
        })
        .filter((category) => category.name && category.slug);
    },
    { ttl: CACHE_TTL.LONG }
  );

  const categories = cats || [];
  const lead = categories.slice(0, 3);
  const rest = categories.slice(3);

  return (
    <main className="min-h-screen bg-[#f4f5f1] text-zinc-950">
      <section className="relative isolate flex min-h-[68svh] items-end overflow-hidden bg-[#07110c] px-5 pb-14 pt-28 text-white md:px-8 md:pb-16">
        <Image src="/bgs/home-hero.jpg" alt="FreshPick food collections" fill priority fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07110c]/94 via-[#07110c]/60 to-[#07110c]/18" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07110c] via-transparent to-black/25" />
        <div className="mx-auto w-full max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-100 backdrop-blur-md"><Sparkles className="h-3.5 w-3.5" /> Browse the market</span>
          <h1 className="mt-6 max-w-5xl font-serif text-6xl font-normal leading-[0.9] tracking-[-0.04em] md:text-8xl">Food, grouped the way you <span className="italic text-emerald-200">actually shop.</span></h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-8 text-white/65">Go straight to a category when you already know the part of the market you need. For meal-led discovery, start with recipes or Discover instead.</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="aspect-[4/5] animate-pulse rounded-[1.75rem] bg-white" />)}</div>
        ) : categories.length === 0 ? (
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-12 text-center"><h2 className="font-serif text-4xl font-normal">The market is being refreshed.</h2><Link href="/products" className="mt-6 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white">Open all products</Link></section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {lead.map((category, index) => (
                <CategoryCard key={category.slug} category={category} priority={index === 0} tall={index === 0} />
              ))}
            </section>

            {rest.length > 0 && (
              <section className="mt-16">
                <div className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-300 pb-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">All categories</p>
                    <h2 className="mt-2 font-serif text-4xl font-normal text-zinc-950">Keep browsing.</h2>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-zinc-400"><Grid2X2 className="h-3.5 w-3.5" /> {categories.length} categories</span>
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((category) => <CategoryCard key={category.slug} category={category} />)}
                </div>
              </section>
            )}

            <section className="mt-16 grid overflow-hidden rounded-[2rem] bg-[#0b1710] text-white md:grid-cols-[1fr_auto] md:items-center">
              <div className="p-7 md:p-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200">Not sure where to start?</p>
                <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-tight">Choose the meal before the aisle.</h2>
                <p className="mt-4 max-w-xl text-sm font-light leading-6 text-white/55">FreshPick Discover starts from what you are trying to eat or solve, then connects the idea to the same live catalogue.</p>
              </div>
              <Link href="/discover" className="m-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-xs font-semibold text-zinc-950 md:m-10">Open Discover <ArrowRight className="h-4 w-4" /></Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function CategoryCard({ category, priority = false, tall = false }: { category: Cat; priority?: boolean; tall?: boolean }) {
  return (
    <Link href={`/categories/${category.slug}`} className={`group relative isolate flex overflow-hidden rounded-[1.75rem] bg-[#102017] p-6 text-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] ${tall ? 'min-h-[500px] md:row-span-1' : 'min-h-[390px]'}`}>
      {category.imageUrl ? <Image src={category.imageUrl} alt={category.name} fill priority={priority} sizes="(max-width: 768px) 100vw, 33vw" className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />
      {!category.imageUrl && <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_70%_20%,rgba(110,231,183,0.2),transparent_35%)]" />}
      <div className="mt-auto">
        <h2 className="font-serif text-4xl font-normal leading-none tracking-[-0.025em]">{category.name}</h2>
        <p className="mt-3 line-clamp-2 max-w-sm text-sm font-light leading-6 text-white/65">{category.description || `Explore FreshPick ${category.name.toLowerCase()} from the live market.`}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}
