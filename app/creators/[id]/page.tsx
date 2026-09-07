import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clock3, UsersRound } from "lucide-react";
import { getCreatorById } from "@/lib/creatorService";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) return { title: "Creator not found | FreshPick" };
  return {
    title: `${creator.name} | FreshPick Creator`,
    description: `Discover shoppable recipes published by ${creator.name} on FreshPick.`,
  };
}

export default async function CreatorPage({ params }: Props) {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) notFound();

  const heroImage = creator.latestRecipe?.image?.url;

  return (
    <main className="min-h-screen bg-[#f5f6f3] text-zinc-950">
      <section className="relative overflow-hidden bg-[#08120d] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={heroImage ? { backgroundImage: `url(\"${heroImage.replace(/\"/g, "%22")}\")` } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08120d] via-[#08120d]/92 to-[#08120d]/45" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 md:px-8 md:pb-28 md:pt-40">
          <Link href="/creators" className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 hover:text-white">← All creators</Link>
          <div className="mt-12 max-w-4xl">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200"><UsersRound className="h-4 w-4" /> FreshPick creator</div>
            <h1 className="mt-5 font-serif text-6xl font-normal leading-[0.9] tracking-[-0.04em] sm:text-7xl md:text-8xl">{creator.name}</h1>
            {creator.cuisines.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {creator.cuisines.map((cuisine) => <span key={cuisine} className="rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-2 text-xs font-light text-white/65">{cuisine}</span>)}
              </div>
            )}
            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/58">Explore recipes from {creator.name}, then shop the ingredients directly through FreshPick.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.6fr] md:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700">From this kitchen</p>
            <h2 className="mt-4 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.03em] md:text-7xl">Recipes worth cooking.</h2>
          </div>
          <p className="max-w-lg text-base font-light leading-7 text-zinc-600 md:justify-self-end">{creator.recipeCount} published recipe{creator.recipeCount === 1 ? "" : "s"}, each connected to the live FreshPick catalogue.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {creator.recipes.map((recipe, index) => (
            <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className={`group overflow-hidden rounded-[2rem] bg-[#102017] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}>
              <div
                className={`relative bg-cover bg-center ${index === 0 ? "h-[520px]" : "h-[370px]"}`}
                style={recipe.image?.url ? { backgroundImage: `linear-gradient(to top, rgba(7,17,12,.92), rgba(7,17,12,.08)), url(\"${recipe.image.url.replace(/\"/g, "%22")}\")` } : { backgroundImage: "linear-gradient(145deg,#153223,#07110c)" }}
              >
                <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                  <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                    <span>{recipe.cuisine || "FreshPick recipe"}</span>
                    <span className="inline-flex items-center gap-1 text-white/45"><Clock3 className="h-3.5 w-3.5" /> {recipe.prepMinutes + recipe.cookMinutes} min</span>
                  </div>
                  <h3 className={`mt-4 max-w-2xl font-serif font-normal leading-[1.02] ${index === 0 ? "text-5xl md:text-6xl" : "text-4xl"}`}>{recipe.title}</h3>
                  <p className="mt-4 max-w-xl text-sm font-light leading-6 text-white/55">{recipe.excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">Shop the recipe <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
