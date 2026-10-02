import Image from "next/image";
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
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <Link href="/recipes" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:underline"><ArrowLeft className="h-4 w-4" /> All recipes</Link>
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="mb-3 text-sm text-brand-green">{[recipe.cuisine, ...recipe.dietaryTags].filter(Boolean).join(" · ")}</p>
              <h1 className="text-3xl font-normal leading-tight md:text-4xl">{recipe.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{recipe.excerpt}</p>
              <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {totalMinutes} min</span>
                <span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4" /> Serves {recipe.servings}</span>
                <span className="inline-flex items-center gap-2"><ShoppingBasket className="h-4 w-4" /> {recipe.ingredientCount} ingredients</span>
              </div>
            </div>
            {recipe.featuredImage?.url && <div className="relative aspect-[4/3] overflow-hidden rounded-lg"><Image src={recipe.featuredImage.url} alt={recipe.title} fill priority sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" /></div>}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="space-y-10">
            {recipe.story && (
              <section>
                <span className="mb-4 block text-xs font-bold normal-case text-brand-green">Why this works</span>
                <div className="max-w-3xl space-y-4 text-base leading-7 text-muted-foreground">
                  {recipe.story.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            )}

            <section>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <span className="mb-4 block text-xs font-bold normal-case text-brand-green">The basket</span>
                  <h2 className="font-serif text-2xl font-normal text-foreground md:text-2xl">Ingredients</h2>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-background">
                {recipe.ingredients.map((ingredient, index) => {
                  const chosen = choices[index];
                  const substituted = Boolean(chosen && ingredient.product && chosen._id !== ingredient.product._id);
                  return (
                    <div key={`${ingredient.productId}-${index}`} className="grid gap-4 border-b border-border p-5 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center md:p-6">
                      <div
                        className="h-[72px] w-[72px] rounded-lg bg-background bg-cover bg-center"
                        style={chosen?.image?.url ? { backgroundImage: `url("${chosen.image.url.replace(/"/g, "%22")}")` } : undefined}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-foreground">{chosen?.name || ingredient.product?.name || "Ingredient unavailable"}</h3>
                          {ingredient.optional && <span className="rounded-full bg-background px-2.5 py-1 text-xs font-bold normal-case text-muted-foreground">Optional</span>}
                          {substituted && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold normal-case text-amber-800"><RefreshCw className="h-3 w-3" /> Substitute</span>}
                        </div>
                        <p className="mt-2 text-sm font-normal text-muted-foreground">{ingredient.quantity} × item{ingredient.note ? ` · ${ingredient.note}` : ""}</p>
                        {!chosen && <p className="mt-2 text-xs font-medium text-red-600">Unavailable right now — FreshPick will skip this item.</p>}
                      </div>
                      <div className="sm:text-right">
                        {chosen ? (
                          <>
                            <p className="font-sans text-xl text-foreground">LKR {(chosen.pricePerBaseQuantity * ingredient.quantity).toLocaleString("en-LK", { maximumFractionDigits: 0 })}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold normal-case text-brand-green"><Check className="h-3.5 w-3.5" /> Available</p>
                          </>
                        ) : <span className="text-xs text-muted-foreground">Not charged</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <span className="mb-4 block text-xs font-bold normal-case text-brand-green">Method</span>
              <h2 className="font-serif text-2xl font-normal text-foreground md:text-2xl">Make it at home.</h2>
              <ol className="mt-9 space-y-5">
                {recipe.steps.map((step, index) => (
                  <li key={`${index}-${step}`} className="grid gap-4 rounded-lg border border-border bg-background p-6 sm:grid-cols-[48px_1fr] md:p-7">
                    <span className="font-sans text-2xl not-italic text-brand-green">{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-base font-normal leading-8 text-foreground">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="rounded-lg border border-border bg-background p-7 lg:sticky lg:top-28 md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white"><ChefHat className="h-5 w-5" /></div>
            <span className="mt-7 block text-xs font-bold normal-case text-brand-green">One-tap meal basket</span>
            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-foreground">The recipe becomes the shopping list.</h2>
            <p className="mt-4 text-sm font-normal leading-7 text-muted-foreground">FreshPick adds what is available, uses approved substitutes when stock changes, and skips anything unavailable instead of blocking the whole meal.</p>

            <div className="my-7 space-y-3 border-y border-border py-6 text-sm">
              <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Available now</span><span className="font-medium text-foreground">{availableIngredientCount}/{recipe.ingredientCount}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Estimated basket</span><span className="font-sans text-xl text-foreground">LKR {estimatedBasket.toLocaleString("en-LK", { maximumFractionDigits: 0 })}</span></div>
            </div>

            <RecipeAddToBag slug={recipe.slug} availableIngredientCount={availableIngredientCount} />
            <p className="mt-4 text-xs font-normal leading-5 text-muted-foreground">Final price and availability are confirmed from your basket before checkout.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
