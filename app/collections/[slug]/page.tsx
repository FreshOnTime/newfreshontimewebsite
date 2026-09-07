import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3, Sparkles, UsersRound } from "lucide-react";
import { getPublishedCollectionBySlug } from "@/lib/collectionService";
import { ProductCard } from "@/components/products/ProductCard";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPublishedCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found | FreshPick" };
  const title = collection.metaTitle || `${collection.title} | FreshPick Collections`;
  const description = collection.metaDescription || collection.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `https://freshpick.lk/collections/${collection.slug}` },
    openGraph: {
      title,
      description,
      url: `https://freshpick.lk/collections/${collection.slug}`,
      type: "website",
      images: collection.featuredImage?.url ? [collection.featuredImage.url] : [],
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getPublishedCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-[#07110c] text-white" style={collection.featuredImage?.url ? { backgroundImage: `linear-gradient(to top,rgba(7,17,12,.96),rgba(7,17,12,.28)),url("${collection.featuredImage.url.replace(/"/g, "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(110,231,183,0.12),transparent_30%)]" />
        <div className="container relative mx-auto max-w-7xl px-4 pb-14 pt-32 md:px-8 md:pb-20">
          <Link href="/collections" className="mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/65 hover:text-white"><ArrowLeft className="h-4 w-4" /> All edits</Link>
          <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-200">{collection.eyebrow}</span>
          <h1 className="max-w-5xl text-balance font-serif text-6xl font-normal leading-[0.9] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[7rem]">{collection.title}</h1>
          <p className="mt-7 max-w-2xl text-base font-light leading-8 text-white/70 md:text-lg">{collection.excerpt}</p>
          <div className="mt-7 flex flex-wrap gap-2">{collection.themeTags.map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md">{tag}</span>)}</div>
        </div>
      </section>

      {collection.story && (
        <section className="bg-white py-20 md:py-28">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">The edit</span>
            <div className="max-w-4xl space-y-5 font-serif text-2xl font-normal leading-[1.4] text-zinc-800 md:text-4xl">{collection.story.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </div>
        </section>
      )}

      {collection.recipes.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-12"><span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">Cook from the edit</span><h2 className="font-serif text-4xl font-normal text-zinc-950 md:text-6xl">Recipes for this moment.</h2></div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {collection.recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_70px_rgba(10,30,18,.08)]">
                  <div className="relative h-[300px] bg-[#102017] bg-cover bg-center" style={recipe.featuredImage?.url ? { backgroundImage: `linear-gradient(to top,rgba(7,17,12,.78),rgba(7,17,12,.05)),url("${recipe.featuredImage.url.replace(/"/g, "%22")}")` } : undefined}><div className="absolute inset-x-0 bottom-0 p-7 text-white"><h3 className="font-serif text-3xl leading-tight">{recipe.title}</h3></div></div>
                  <div className="p-7"><p className="text-sm font-light leading-7 text-zinc-600">{recipe.excerpt}</p><div className="mt-6 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-5 text-xs text-zinc-500"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span><span className="inline-flex items-center gap-1.5"><UsersRound className="h-4 w-4" />{recipe.servings}</span><ArrowUpRight className="ml-auto h-4 w-4 text-emerald-800" /></div></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {collection.products.length > 0 && (
        <section className="bg-white py-20 md:py-28">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><span className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700"><Sparkles className="h-3.5 w-3.5" /> Selected for the edit</span><h2 className="font-serif text-4xl font-normal text-zinc-950 md:text-6xl">The FreshPick shelf.</h2></div><Link href="/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">Shop full market <ArrowUpRight className="h-4 w-4" /></Link></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
              {collection.products.map((product, index) => (
                <ProductCard key={product.sku} id={product._id?.toString() || ""} sku={product.sku} name={product.name} image={product.image?.url || ""} discountPercentage={product.discountPercentage || 0} baseMeasurementQuantity={product.baseMeasurementQuantity} pricePerBaseQuantity={product.pricePerBaseQuantity} measurementType={product.measurementUnit} isDiscreteItem={product.isSoldAsUnit} priority={index < 2} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
