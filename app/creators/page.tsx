import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChefHat, Eye, Heart, UsersRound } from "lucide-react";
import { listCreators } from "@/lib/creatorService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Creators | FreshPick",
  description: "Discover the people publishing shoppable recipes on FreshPick. Profiles and counts come directly from published recipe activity.",
};

export default async function CreatorsPage() {
  const creators = await listCreators(48);

  return (
    <main className="min-h-screen bg-[#f5f6f3] pb-24 pt-28 text-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="grid gap-8 border-b border-zinc-300 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700"><UsersRound className="h-4 w-4" /> FreshPick creators</div>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-normal leading-none md:text-7xl">People behind shoppable food ideas.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">This directory is generated from actual published recipe authors. No placeholder chefs or fabricated follower counts.</p>
          </div>
          <Link href="/recipes" className="inline-flex h-11 items-center gap-2 border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700">Browse all recipes <ArrowUpRight className="h-4 w-4" /></Link>
        </header>

        {creators.length === 0 ? (
          <div className="mt-10 border border-zinc-300 bg-white p-8 text-sm leading-6 text-zinc-500">Creator profiles appear automatically when published recipes have authors. There are no published creator profiles yet.</div>
        ) : (
          <section className="mt-10 grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/creators/${creator.id}`} className="group bg-white p-6 transition-colors hover:bg-emerald-50/50 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 font-serif text-lg text-white">
                    {creator.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </div>

                <h2 className="mt-8 font-serif text-3xl font-normal text-zinc-950">{creator.name}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {creator.cuisines.map((cuisine) => <span key={cuisine} className="border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-500">{cuisine}</span>)}
                </div>

                <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-5 text-xs">
                  <div><dt className="flex items-center gap-1 text-zinc-400"><ChefHat className="h-3.5 w-3.5" /> Recipes</dt><dd className="mt-1 font-semibold tabular-nums text-zinc-900">{creator.recipeCount}</dd></div>
                  <div><dt className="flex items-center gap-1 text-zinc-400"><Eye className="h-3.5 w-3.5" /> Views</dt><dd className="mt-1 font-semibold tabular-nums text-zinc-900">{creator.totalViews.toLocaleString()}</dd></div>
                  <div><dt className="flex items-center gap-1 text-zinc-400"><Heart className="h-3.5 w-3.5" /> Likes</dt><dd className="mt-1 font-semibold tabular-nums text-zinc-900">{creator.totalLikes.toLocaleString()}</dd></div>
                </dl>

                {creator.latestRecipe && (
                  <div className="mt-6 border-t border-zinc-200 pt-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">Latest published recipe</p>
                    <p className="mt-2 text-sm font-medium text-zinc-800">{creator.latestRecipe.title}</p>
                  </div>
                )}
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
