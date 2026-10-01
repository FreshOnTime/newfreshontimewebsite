import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChefHat } from "lucide-react";
import FoodDiscovery from "@/components/home/FoodDiscovery";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { listPublishedRecipes } from "@/lib/recipeService";
import { getTrendingProducts } from "@/lib/intelligence/tasteGraph";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Discover Food | FreshPick Sri Lanka",
  description: "Discover recipes, ready meals, local makers and food picks with FreshPick.",
  alternates: { canonical: "https://freshpick.lk/discover" },
};

export default async function DiscoverPage() {
  const [recipes, trending] = await Promise.all([
    listPublishedRecipes(4),
    getTrendingProducts(5).catch(() => []),
  ]);

  return (
    <main className="bg-background pb-24">
      <PremiumPageHeader title="A little food inspiration" subtitle="Find something to cook, something ready or something new from a local maker." />
      <FoodDiscovery />
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-3xl font-semibold text-brand-green">Recipes to try</h2>
          <Link href="/recipes" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline">All recipes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        {recipes.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border p-6 text-muted-foreground">Recipes will appear here as they are published.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green">
                <div className="relative aspect-[4/3] bg-secondary">
                  {recipe.featuredImage?.url ? <Image src={recipe.featuredImage.url} alt={recipe.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><ChefHat className="h-10 w-10 text-brand-green" aria-hidden="true" /></div>}
                </div>
                <div className="p-5">
                  {recipe.cuisine && <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>}
                  <h3 className="mt-2 text-lg font-semibold text-brand-green">{recipe.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-green">Shop the recipe <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <h2 className="font-heading text-3xl font-semibold text-brand-green">Popular at the market</h2>
          <p className="mt-3 text-muted-foreground">Favourites from recent FreshPick orders.</p>
          <div className="mt-6 divide-y divide-border rounded-xl border border-border">
            {trending.map((item) => <Link key={item.product._id} href={`/products/${item.product.sku}`} className="flex items-center justify-between gap-4 px-5 py-4 text-brand-green hover:bg-secondary"><span>{item.product.name}</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}
          </div>
        </section>
      )}
    </main>
  );
}
