import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { ArrowRight, ChefHat, Search } from "lucide-react";
import prisma from "@/lib/prisma";
import { normalizeFeaturedImage } from "@/lib/recipeContent";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import ProductGrid from "@/components/products/ProductGrid";
import { Product } from "@/models/product";

const searchProducts = unstable_cache(async (query: string) => {
  if (!query.trim()) return [];
  const products = await prisma.product.findMany({
    where: {
      archived: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    select: productCardSelect,
    orderBy: [{ stockQty: "desc" }, { createdAt: "desc" }],
    take: 40,
  });
  return products.map((product) => serializeProductCardForUi(product) as Product);
}, ["storefront-search-v3"], { revalidate: 180, tags: ["products"] });

const searchRecipes = unstable_cache(async (query: string) => {
  if (!query.trim()) return [];
  const recipes = await prisma.blog.findMany({
    where: {
      category: "recipe",
      published: true,
      isDeleted: false,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, authorName: true },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: 8,
  });
  return recipes.map((recipe) => ({ ...recipe, image: normalizeFeaturedImage(recipe.featuredImage) }));
}, ["recipe-search-v1"], { revalidate: 180, tags: ["recipes"] });

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = (getString(params.q) || "").trim();
  const [products, recipes] = query ? await Promise.all([searchProducts(query), searchRecipes(query)]) : [[], []];
  const total = products.length + recipes.length;

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white px-5 pb-12 pt-28 md:px-8 md:pb-14 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700">Search FreshPick</span>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-normal leading-none tracking-[-0.03em] md:text-7xl">
            {query ? <>Results for <span className="italic text-emerald-900">“{query}”</span></> : <>What are you <span className="italic text-emerald-900">looking for?</span></>}
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-zinc-500">
            Search across the live market and published shoppable recipes from the same place.
          </p>

          <form action="/search" className="mt-8 max-w-2xl">
            <div className="flex h-14 items-center rounded-full border border-zinc-300 bg-[#f8f9f7] px-5 transition-colors focus-within:border-emerald-400 focus-within:bg-white">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input name="q" defaultValue={query} autoFocus={!query} placeholder="Try dinner, mango, pasta, tea…" className="ml-3 min-w-0 flex-1 bg-transparent text-base font-light outline-none placeholder:text-zinc-400" />
              <button type="submit" className="ml-3 rounded-full bg-zinc-950 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-emerald-950">Search</button>
            </div>
          </form>

          {query && <p className="mt-4 text-xs text-zinc-400">{total} result{total === 1 ? '' : 's'} across food ideas and products</p>}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-12 md:px-8 md:pt-16">
        {!query ? (
          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["Need dinner?", "Start with shoppable recipes instead of products.", "/recipes"],
              ["Just browsing?", "Open Discover for moods, makers and ready food.", "/discover"],
              ["Know the list?", "Go straight to the live market and its filters.", "/products"],
            ].map(([title, copy, href]) => (
              <Link key={href} href={href} className="group rounded-[1.6rem] border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-300">
                <h2 className="font-serif text-3xl font-normal text-zinc-950">{title}</h2>
                <p className="mt-3 text-sm font-light leading-6 text-zinc-500">{copy}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </section>
        ) : total === 0 ? (
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center md:p-16">
            <h2 className="font-serif text-4xl font-normal text-zinc-950">Nothing exact yet.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-7 text-zinc-500">Try a broader food name or move into Discover, where you can start from a craving or meal instead of a product keyword.</p>
            <Link href="/discover" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-950">Open Discover</Link>
          </section>
        ) : (
          <div className="space-y-16">
            {recipes.length > 0 && (
              <section>
                <div className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-300 pb-5">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700"><ChefHat className="h-3.5 w-3.5" /> Cook from this</p>
                    <h2 className="mt-2 font-serif text-4xl font-normal text-zinc-950">Shoppable recipes</h2>
                  </div>
                  <Link href="/recipes" className="text-xs font-semibold text-emerald-800">All recipes</Link>
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recipes.map((recipe) => (
                    <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-emerald-300">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#102017]">
                        {recipe.image?.url ? <Image src={recipe.image.url} alt={recipe.image.alt || recipe.title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-2xl font-normal leading-tight text-zinc-950">{recipe.title}</h3>
                        <p className="mt-3 line-clamp-2 text-sm font-light leading-6 text-zinc-500">{recipe.excerpt}</p>
                        <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">Shop the recipe <ArrowRight className="h-3.5 w-3.5" /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {products.length > 0 && (
              <section>
                <div className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-300 pb-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">From the market</p>
                    <h2 className="mt-2 font-serif text-4xl font-normal text-zinc-950">Products</h2>
                  </div>
                  <span className="text-xs text-zinc-400">{products.length} matched</span>
                </div>
                <div className="mt-7"><ProductGrid products={products} /></div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
