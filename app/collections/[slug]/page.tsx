import { pageMetadata } from '@/lib/seo';
import FoodStoryCard from "@/components/ui/FoodStoryCard";

import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { getPublishedCollectionBySlug } from "@/lib/collectionService";
import { ProductCard } from "@/components/products/ProductCard";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPublishedCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found | FreshPick", robots: { index: false, follow: false } };
  const title = collection.metaTitle || `${collection.title} | FreshPick Collections`;
  const description = collection.metaDescription || collection.excerpt;
  return pageMetadata({ title, description, path: `/collections/${encodeURIComponent(collection.slug)}`, image: collection.featuredImage?.url, type: 'website' });
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getPublishedCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <div className="min-h-screen bg-background">
      <PremiumPageHeader title={collection.title} subtitle={collection.excerpt} backgroundImage={collection.featuredImage?.url} />

      {collection.story && (
        <section className="bg-background py-8 md:py-10">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <span className="mb-5 block text-xs font-bold normal-case text-brand-green">The edit</span>
            <div className="max-w-4xl space-y-4 text-base leading-7 text-muted-foreground">{collection.story.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </div>
        </section>
      )}

      {collection.recipes.length > 0 && (
        <section className="py-8 md:py-10">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6"><span className="mb-4 block text-xs font-bold normal-case text-brand-green">Cook from the edit</span><h2 className="font-serif text-2xl font-normal text-foreground md:text-2xl">Recipes</h2></div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {collection.recipes.map((recipe) => (
                <FoodStoryCard key={recipe.id} href={`/recipes/${recipe.slug}`} title={recipe.title} image={recipe.featuredImage?.url} description={recipe.excerpt} meta={`${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min · Serves ${recipe.servings}`} action="View recipe" />
              ))}
            </div>
          </div>
        </section>
      )}

      {collection.products.length > 0 && (
        <section className="bg-background py-8 md:py-10">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-6"><div><span className="mb-4 inline-flex items-center gap-2 text-xs font-bold normal-case text-brand-green"><Sparkles className="h-3.5 w-3.5" /> Selected for the edit</span><h2 className="font-serif text-2xl font-normal text-foreground md:text-2xl">Products in this collection</h2></div><Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold normal-case text-brand-green">Shop full market <ArrowUpRight className="h-4 w-4" /></Link></div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
              {collection.products.map((product, index) => (
                <ProductCard key={product.sku} id={product._id?.toString() || ""} sku={product.sku} name={product.name} image={product.image?.url || ""} discountPercentage={product.discountPercentage || 0} baseMeasurementQuantity={product.baseMeasurementQuantity} pricePerBaseQuantity={product.pricePerBaseQuantity} measurementType={product.measurementUnit} isDiscreteItem={product.isSoldAsUnit} priority={index < 2} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
