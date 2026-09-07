import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChefHat, Clock3, ShoppingBasket } from "lucide-react";
import { listPublishedRecipes } from "@/lib/recipeService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dinner Ideas | FreshPick",
  description: "Choose a published FreshPick recipe and turn its ingredients into a stock-aware shopping basket.",
};

export default async function MealKitsPage() {
  const recipes = await listPublishedRecipes(8).catch(() => []);

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="relative isolate flex min-h-[66svh] items-end overflow-hidden bg-[#07110c] px-5 pb-14 pt-28 text-white md:px-8 md:pb-16">
        <Image src="/bgs/home-hero.jpg" alt="Dinner ingredients from FreshPick" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07110c]/94 via-[#07110c]/62 to-[#07110c]/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07110c] via-transparent to-black/20" />
        <div className="mx-auto w-full max-w-6xl">
          <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200"><ChefHat className="h-3.5 w-3.5" /> Dinner from FreshPick</span>
          <h1 className="mt-5 max-w-5xl font-serif text-6xl font-normal leading-[0.9] tracking-[-0.04em] md:text-8xl">Choose the dish. <span className="italic text-emerald-200">We’ll connect the ingredients.</span></h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-8 text-white/65">FreshPick’s live recipe flow checks catalogue products and approved substitutions before building the basket. No fixed “meal kit” price or fictional box is shown here.</p>
          <Link href="/recipes" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-xs font-semibold text-zinc-950">All shoppable recipes <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-300 pb-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">Published now</p>
              <h2 className="mt-2 font-serif text-4xl font-normal md:text-5xl">Dinner ideas you can actually shop.</h2>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-light text-zinc-400"><ShoppingBasket className="h-3.5 w-3.5" /> Stock-aware ingredient baskets</span>
          </div>

          {recipes.length === 0 ? (
            <div className="mt-7 rounded-[1.75rem] border border-zinc-200 bg-white p-10 text-sm font-light leading-7 text-zinc-500">No recipes are published right now. The live market remains available while Recipe Studio content is updated.</div>
          ) : (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-emerald-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#102017]">
                    {recipe.featuredImage?.url ? <Image src={recipe.featuredImage.url} alt={recipe.featuredImage.alt || recipe.title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400"><span>{recipe.cuisine || 'Recipe'}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span></div>
                    <h3 className="mt-3 font-serif text-2xl font-normal leading-tight text-zinc-950">{recipe.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm font-light leading-6 text-zinc-500">{recipe.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">Open recipe <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
