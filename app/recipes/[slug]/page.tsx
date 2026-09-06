import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ChefHat, Clock3, RefreshCw, ShoppingBasket, UsersRound } from "lucide-react";
import { getPublishedRecipeBySlug } from "@/lib/recipeService";
import RecipeAddToBag from "@/components/recipes/RecipeAddToBag";
import type { RecipeIngredient } from "@/models/recipe";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 60;

function purchasableChoice(ingredient: RecipeIngredient) {
  if (ingredient.product && !ingredient.product.isOutOfStock && ingredient.product.stockQuantity >= ingredient.quantity) {
    return ingredient.product;
  }
  return ingredient.substitutions.find(
    (product) => !product.isOutOfStock && product.stockQuantity >= ingredient.quantity
  ) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getPublishedRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe not found | FreshPick" };

  const title = recipe.metaTitle || `${recipe.title} | FreshPick Recipes`;
  const description = recipe.metaDescription || recipe.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `https://freshpick.lk/recipes/${recipe.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://freshpick.lk/recipes/${recipe.slug}`,
      images: recipe.featuredImage?.url ? [recipe.featuredImage.url] : [],
    },
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = await getPublishedRecipeBySlug(slug);
  if (!recipe) notFound();

  const choices = recipe.ingredients.map((ingredient) => purchasableChoice(ingredient));
  const availableIngredientCount = choices.filter(Boolean).length;
  const estimatedBasket = recipe.ingredients.reduce((sum, ingredient, index) => {
    const product = choices[index];
    return product ? sum + product.pricePerBaseQuantity * ingredient.quantity : sum;
  }, 0);
  const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt,
    image: recipe.featuredImage?.url ? [recipe.featuredImage.url] : undefined,
    author: { "@type": "Organization", name: recipe.authorName || "FreshPick" },
    prepTime: `PT${recipe.prepTimeMinutes}M`,
    cookTime: `PT${recipe.cookTimeMinutes}M`,
    totalTime: `PT${totalMinutes}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCuisine: recipe.cuisine || undefined,
    recipeCategory: "Dinner",
    keywords: [...recipe.tags, ...recipe.dietaryTags].join(", "),
    recipeIngredient: recipe.ingredients.map((ingredient) => {
      const name = ingredient.product?.name || "FreshPick ingredient";
      return `${ingredient.quantity} × ${name}${ingredient.note ? ` — ${ingredient.note}` : ""}`;
    }),
    recipeInstructions: recipe.steps.map((step) => ({ "@type": "HowToStep", text: step })),
  };

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />

      <section
        className="relative flex min-h-[72vh] items-end overflow-hidden bg-[#07110c] text-white"
        style={recipe.featuredImage?.url ? {
          backgroundImage: `linear-gradient(to top, rgba(7,17,12,.96) 0%, rgba(7,17,12,.45) 52%, rgba(7,17,12,.25) 100%), url("${recipe.featuredImage.url.replace(/"/g, "%22")}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        } : undefined}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(110,231,183,0.12),transparent_30%)]" />
        <div className="container relative mx-auto max-w-7xl px-4 pb-14 pt-32 md:px-8 md:pb-20">
          <Link href="/recipes" className="mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/65 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All recipes
          </Link>
          <div className="max-w-5xl">
            <div className="mb-6 flex flex-wrap gap-2">
              {recipe.cuisine && <span className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">{recipe.cuisine}</span>}
              {recipe.dietaryTags.map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">{tag}</span>)}
            </div>
            <h1 className="text-balance font-serif text-6xl font-normal leading-[0.9] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[7rem]">{recipe.title}</h1>
            <p className="mt-7 max-w-2xl text-base font-light leading-8 text-white/70 md:text-lg">{recipe.excerpt}</p>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6 text-sm text-white/70">
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {totalMinutes} minutes</span>
              <span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4" /> Serves {recipe.servings}</span>
              <span className="inline-flex items-center gap-2"><ShoppingBasket className="h-4 w-4" /> {recipe.ingredientCount} ingredients</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="space-y-16">
            {recipe.story && (
              <section>
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">Why this works</span>
                <div className="max-w-3xl space-y-5 font-serif text-2xl font-normal leading-[1.35] text-zinc-800 md:text-3xl">
                  {recipe.story.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            )}

            <section>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">The basket</span>
                  <h2 className="font-serif text-4xl font-normal text-zinc-950 md:text-5xl">Everything for the meal.</h2>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white">
                {recipe.ingredients.map((ingredient, index) => {
                  const chosen = choices[index];
                  const substituted = Boolean(chosen && ingredient.product && chosen._id !== ingredient.product._id);
                  return (
                    <div key={`${ingredient.productId}-${index}`} className="grid gap-4 border-b border-zinc-100 p-5 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center md:p-6">
                      <div
                        className="h-[72px] w-[72px] rounded-2xl bg-zinc-100 bg-cover bg-center"
                        style={chosen?.image?.url ? { backgroundImage: `url("${chosen.image.url.replace(/"/g, "%22")}")` } : undefined}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-zinc-950">{chosen?.name || ingredient.product?.name || "Ingredient unavailable"}</h3>
                          {ingredient.optional && <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">Optional</span>}
                          {substituted && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-800"><RefreshCw className="h-3 w-3" /> Substitute</span>}
                        </div>
                        <p className="mt-2 text-sm font-light text-zinc-500">{ingredient.quantity} × item{ingredient.note ? ` · ${ingredient.note}` : ""}</p>
                        {!chosen && <p className="mt-2 text-xs font-medium text-red-600">Unavailable right now — FreshPick will skip this item.</p>}
                      </div>
                      <div className="sm:text-right">
                        {chosen ? (
                          <>
                            <p className="font-serif text-xl text-zinc-950">LKR {(chosen.pricePerBaseQuantity * ingredient.quantity).toLocaleString("en-LK", { maximumFractionDigits: 0 })}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700"><Check className="h-3.5 w-3.5" /> Available</p>
                          </>
                        ) : <span className="text-xs text-zinc-400">Not charged</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">Method</span>
              <h2 className="font-serif text-4xl font-normal text-zinc-950 md:text-5xl">Make it at home.</h2>
              <ol className="mt-9 space-y-5">
                {recipe.steps.map((step, index) => (
                  <li key={`${index}-${step}`} className="grid gap-4 rounded-[1.5rem] border border-zinc-200 bg-white p-6 sm:grid-cols-[48px_1fr] md:p-7">
                    <span className="font-serif text-2xl italic text-emerald-800">{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-base font-light leading-8 text-zinc-700">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-[0_24px_80px_rgba(10,30,18,0.07)] lg:sticky lg:top-28 md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-white"><ChefHat className="h-5 w-5" /></div>
            <span className="mt-7 block text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-700">One-tap meal basket</span>
            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-zinc-950">The recipe becomes the shopping list.</h2>
            <p className="mt-4 text-sm font-light leading-7 text-zinc-600">FreshPick adds what is available, uses approved substitutes when stock changes, and skips anything unavailable instead of blocking the whole meal.</p>

            <div className="my-7 space-y-3 border-y border-zinc-100 py-6 text-sm">
              <div className="flex items-center justify-between gap-4"><span className="text-zinc-500">Available now</span><span className="font-medium text-zinc-950">{availableIngredientCount}/{recipe.ingredientCount}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-zinc-500">Estimated basket</span><span className="font-serif text-xl text-zinc-950">LKR {estimatedBasket.toLocaleString("en-LK", { maximumFractionDigits: 0 })}</span></div>
            </div>

            <RecipeAddToBag slug={recipe.slug} availableIngredientCount={availableIngredientCount} />
            <p className="mt-4 text-xs font-light leading-5 text-zinc-400">Final price and availability are confirmed from your basket before checkout.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
