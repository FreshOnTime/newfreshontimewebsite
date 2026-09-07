import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChefHat, Clock3, Eye, Heart, UsersRound } from "lucide-react";
import { getCreatorById } from "@/lib/creatorService";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) return { title: "Creator not found | FreshPick" };
  return {
    title: `${creator.name} | FreshPick Creator`,
    description: `${creator.name} has ${creator.recipeCount} published shoppable recipes on FreshPick.`,
  };
}

export default async function CreatorPage({ params }: Props) {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) notFound();

  return (
    <main className="min-h-screen bg-[#f5f6f3] pb-24 pt-28 text-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="grid gap-8 border-b border-zinc-300 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-950 font-serif text-xl text-white md:h-20 md:w-20">
              {creator.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700"><UsersRound className="h-4 w-4" /> FreshPick creator</div>
              <h1 className="mt-3 font-serif text-5xl font-normal leading-none md:text-7xl">{creator.name}</h1>
              {creator.cuisines.length > 0 && <p className="mt-4 text-sm text-zinc-500">Published across {creator.cuisines.join(", ")}.</p>}
            </div>
          </div>
          <Link href="/creators" className="text-sm font-semibold text-zinc-700">← All creators</Link>
        </header>

        <section className="grid gap-px border-x border-b border-zinc-300 bg-zinc-300 sm:grid-cols-3">
          <div className="bg-white p-5"><div className="flex items-center gap-2 text-xs text-zinc-400"><ChefHat className="h-4 w-4" /> Published recipes</div><div className="mt-3 text-3xl font-semibold tabular-nums">{creator.recipeCount}</div></div>
          <div className="bg-white p-5"><div className="flex items-center gap-2 text-xs text-zinc-400"><Eye className="h-4 w-4" /> Recipe views</div><div className="mt-3 text-3xl font-semibold tabular-nums">{creator.totalViews.toLocaleString()}</div></div>
          <div className="bg-white p-5"><div className="flex items-center gap-2 text-xs text-zinc-400"><Heart className="h-4 w-4" /> Recipe likes</div><div className="mt-3 text-3xl font-semibold tabular-nums">{creator.totalLikes.toLocaleString()}</div></div>
        </section>

        <section className="pt-14">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-zinc-300 pb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Published portfolio</p>
              <h2 className="mt-3 font-serif text-4xl font-normal md:text-5xl">Recipes you can actually shop.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-500">Every item below is a published recipe backed by the live FreshPick recipe resolver.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {creator.recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group border border-zinc-200 bg-white transition-colors hover:border-emerald-300">
                <div
                  className="h-64 bg-[#102017] bg-cover bg-center"
                  style={recipe.image?.url ? { backgroundImage: `linear-gradient(to top, rgba(7,17,12,.58), rgba(7,17,12,.05)), url(\"${recipe.image.url.replace(/\"/g, "%22")}\")` } : undefined}
                />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                    <span>{recipe.cuisine || "Recipe"}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {recipe.prepMinutes + recipe.cookMinutes} min</span>
                  </div>
                  <h3 className="mt-4 font-serif text-3xl font-normal leading-tight text-zinc-950">{recipe.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{recipe.excerpt}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400">
                    <span>{recipe.views.toLocaleString()} views · {recipe.likes.toLocaleString()} likes</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-emerald-800">Shop recipe <ArrowUpRight className="h-3.5 w-3.5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
