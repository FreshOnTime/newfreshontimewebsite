import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, UsersRound } from "lucide-react";
import { listCreators } from "@/lib/creatorService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FreshPick Creators | Recipes & Food Ideas",
  description: "Meet the people publishing shoppable recipes and food ideas on FreshPick.",
};

export default async function CreatorsPage() {
  const creators = await listCreators(48);

  return (
    <main className="min-h-screen bg-[#f5f6f3] text-zinc-950">
      <section className="bg-[#08120d] px-4 pb-20 pt-32 text-white md:px-8 md:pb-28 md:pt-40">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">
            <UsersRound className="h-4 w-4" /> FreshPick creators
          </span>
          <h1 className="mt-6 max-w-5xl font-serif text-6xl font-normal leading-[0.9] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[7rem]">
            Good food usually starts with <span className="italic text-emerald-200">someone.</span>
          </h1>
          <div className="mt-8 grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">
              Discover people through the recipes they actually publish on FreshPick, then shop the ingredients straight from the idea.
            </p>
            <Link href="/recipes" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 hover:text-white">
              Browse all recipes <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        {creators.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="font-serif text-3xl">The creator kitchen is still taking shape.</p>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-7 text-zinc-500">Profiles appear automatically as shoppable recipes are published with authors.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator, index) => {
              const image = creator.latestRecipe?.image?.url;
              return (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.id}`}
                  className={`group overflow-hidden rounded-[2rem] bg-[#102017] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
                >
                  <div
                    className={`relative bg-cover bg-center ${index === 0 ? "h-[520px]" : "h-[390px]"}`}
                    style={image ? { backgroundImage: `linear-gradient(to top, rgba(7,17,12,.92), rgba(7,17,12,.10)), url(\"${image.replace(/\"/g, "%22")}\")` } : { backgroundImage: "linear-gradient(145deg,#153223,#07110c)" }}
                  >
                    <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                      <div className="flex items-end justify-between gap-6">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200">FreshPick creator</p>
                          <h2 className={`mt-3 font-serif font-normal leading-tight ${index === 0 ? "text-5xl md:text-6xl" : "text-4xl"}`}>{creator.name}</h2>
                          {creator.latestRecipe && <p className="mt-4 max-w-xl text-sm font-light leading-6 text-white/60">Latest recipe · {creator.latestRecipe.title}</p>}
                        </div>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
                        <span>{creator.recipeCount} recipe{creator.recipeCount === 1 ? "" : "s"}</span>
                        {creator.cuisines.slice(0, 3).map((cuisine) => <span key={cuisine}>· {cuisine}</span>)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
