import Link from "next/link";
import { ArrowUpRight, ChefHat, Eye, Heart, UsersRound } from "lucide-react";
import { listCreators } from "@/lib/creatorService";

export default async function CreatorNetwork() {
  const creators = await listCreators(4).catch(() => []);

  return (
    <section className="border-t border-zinc-200 bg-white py-20 md:py-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 border-b border-zinc-300 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              <UsersRound className="h-4 w-4" /> Creator network
            </div>
            <h2 className="mt-4 max-w-4xl font-serif text-5xl font-normal leading-[0.96] tracking-tight text-zinc-950 md:text-6xl">
              Food ideas with a person behind them.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-500">
              Profiles below are generated from published shoppable recipes and their real engagement. No placeholder chefs or invented follower counts.
            </p>
          </div>
          <Link href="/creators" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700">
            Browse creators <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {creators.length === 0 ? (
          <div className="border-x border-b border-zinc-300 bg-[#f6f7f4] px-6 py-12 text-sm text-zinc-500">
            Creator profiles will appear here when recipes are published with authors.
          </div>
        ) : (
          <div className="grid gap-px border-x border-b border-zinc-300 bg-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/creators/${creator.id}`} className="group min-h-[280px] bg-white p-6 transition-colors hover:bg-emerald-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950 font-serif text-sm text-white">
                    {creator.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </div>

                <div className="mt-10">
                  <h3 className="font-serif text-2xl font-normal text-zinc-950">{creator.name}</h3>
                  {creator.latestRecipe && <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">Latest: {creator.latestRecipe.title}</p>}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2 border-t border-zinc-200 pt-4 text-[10px] text-zinc-400">
                  <span className="inline-flex items-center gap-1"><ChefHat className="h-3.5 w-3.5" /> {creator.recipeCount}</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {creator.totalViews.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {creator.totalLikes.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
