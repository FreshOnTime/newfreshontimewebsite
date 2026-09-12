import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Grid2X2, Sparkles } from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop by Category",
  description: "Browse FreshPick grocery categories and shop fresh food, pantry essentials and everyday favourites across Colombo.",
};

type Category = {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
      },
    });
  } catch (error) {
    console.error("Failed to load FreshPick categories:", error);
    return [];
  }
}

export default async function CategoriesIndex() {
  const categories = await getCategories();
  const lead = categories.slice(0, 3);
  const rest = categories.slice(3);

  return (
    <main className="min-h-screen bg-brand-cream text-zinc-950">
      <section className="relative isolate flex min-h-[64svh] items-end overflow-hidden bg-brand-green-deep px-5 pb-14 pt-28 text-white md:px-8 md:pb-16">
        <Image
          src="/bgs/home-hero.jpg"
          alt="FreshPick food collections"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="-z-30 object-cover"
        />
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-brand-green-deep via-brand-green-deep/85 to-brand-green/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-green-deep via-transparent to-black/20" />
        <div className="absolute -right-20 top-16 -z-10 h-64 w-64 rounded-full bg-brand-orange/25 blur-3xl" />
        <div className="absolute right-20 top-32 -z-10 h-44 w-44 rounded-full bg-brand-lime/20 blur-3xl" />

        <div className="mx-auto w-full max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lime/35 bg-brand-green/30 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-lime" />
            Browse the market
          </span>
          <h1 className="mt-6 max-w-5xl font-serif text-6xl font-normal leading-[0.9] tracking-[-0.04em] md:text-8xl">
            Fresh food, sorted for the way you
            <span className="italic text-brand-lime"> actually shop.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-8 text-white/70">
            Jump straight into produce, pantry essentials, ready-to-eat favourites and more. Every category connects to the same live FreshPick catalogue.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        {categories.length === 0 ? (
          <section className="rounded-[2rem] border border-emerald-100 bg-white p-12 text-center shadow-premium">
            <div className="mx-auto mb-5 h-2 w-20 rounded-full bg-gradient-to-r from-brand-green via-brand-lime to-brand-orange" />
            <h2 className="font-serif text-4xl font-normal text-brand-green-deep">The market is being refreshed.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500">
              Categories are temporarily unavailable, but the full catalogue is still open.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-xs font-semibold text-white transition hover:bg-brand-green-deep"
            >
              Open all products <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {lead.map((category, index) => (
                <CategoryCard
                  key={category.slug}
                  category={category}
                  priority={index === 0}
                  tall={index === 0}
                  accent={index === 1 ? "orange" : index === 2 ? "lime" : "green"}
                />
              ))}
            </section>

            {rest.length > 0 && (
              <section className="mt-16">
                <div className="flex flex-wrap items-end justify-between gap-5 border-b border-emerald-100 pb-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-orange">All categories</p>
                    <h2 className="mt-2 font-serif text-4xl font-normal text-brand-green-deep">Keep browsing.</h2>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
                    <Grid2X2 className="h-3.5 w-3.5 text-brand-lime" /> {categories.length} categories
                  </span>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((category, index) => (
                    <CategoryCard
                      key={category.slug}
                      category={category}
                      accent={index % 3 === 0 ? "green" : index % 3 === 1 ? "orange" : "lime"}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="relative mt-16 grid overflow-hidden rounded-[2rem] bg-brand-green-deep text-white shadow-premium-lg md:grid-cols-[1fr_auto] md:items-center">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-orange/20 blur-3xl" />
              <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-brand-lime/15 blur-3xl" />
              <div className="relative p-7 md:p-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-lime">Not sure where to start?</p>
                <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-tight">Choose the meal before the aisle.</h2>
                <p className="mt-4 max-w-xl text-sm font-light leading-6 text-white/60">
                  FreshPick Discover starts with what you want to eat, then connects the idea to products already available in the market.
                </p>
              </div>
              <Link
                href="/discover"
                className="relative m-7 inline-flex h-12 items-center gap-2 rounded-full bg-brand-orange px-6 text-xs font-semibold text-white transition hover:brightness-105 md:m-10"
              >
                Open Discover <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function CategoryCard({
  category,
  priority = false,
  tall = false,
  accent = "green",
}: {
  category: Category;
  priority?: boolean;
  tall?: boolean;
  accent?: "green" | "orange" | "lime";
}) {
  const accentClass =
    accent === "orange"
      ? "bg-brand-orange text-white"
      : accent === "lime"
        ? "bg-brand-lime text-brand-green-deep"
        : "bg-brand-green text-white";

  return (
    <Link
      href={`/categories/${encodeURIComponent(category.slug)}`}
      className={`group relative isolate flex overflow-hidden rounded-[1.75rem] bg-brand-green-deep p-6 text-white shadow-premium transition duration-500 hover:-translate-y-1 hover:shadow-premium-hover ${
        tall ? "min-h-[500px] md:row-span-1" : "min-h-[390px]"
      }`}
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="-z-30 object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : null}

      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-brand-green-deep via-brand-green-deep/55 to-transparent" />
      {!category.imageUrl && (
        <>
          <div className="absolute inset-0 -z-30 bg-gradient-to-br from-brand-green to-brand-green-deep" />
          <div className="absolute -right-16 -top-14 -z-20 h-52 w-52 rounded-full bg-brand-lime/20 blur-2xl" />
          <div className="absolute bottom-12 left-8 -z-20 h-28 w-28 rounded-full bg-brand-orange/20 blur-2xl" />
        </>
      )}

      <div className="mt-auto">
        <span className={`mb-4 inline-flex rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${accentClass}`}>
          FreshPick market
        </span>
        <h2 className="font-serif text-4xl font-normal leading-none tracking-[-0.025em]">{category.name}</h2>
        <p className="mt-3 line-clamp-2 max-w-sm text-sm font-light leading-6 text-white/70">
          {category.description || `Explore FreshPick ${category.name.toLowerCase()} from the live market.`}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-lime">
          Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
