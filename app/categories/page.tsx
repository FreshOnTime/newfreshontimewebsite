import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import prisma from "@/lib/prisma";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

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
  return (
    <main className="min-h-screen bg-background pb-24">
      <PremiumPageHeader title="Shop by category" subtitle="Fresh produce, pantry staples, ready meals and more. Find your everyday favourites." />
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
        {categories.length === 0 ? (
          <section className="rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="font-heading text-2xl text-brand-green">Categories are being refreshed.</h2>
            <p className="mt-3 text-muted-foreground">You can still browse the full market.</p>
            <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-amber px-6 py-3 font-semibold text-accent-foreground">Shop all products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link key={category.slug} href={`/categories/${encodeURIComponent(category.slug)}`} className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green">
                <div className="relative aspect-[4/3] bg-secondary">
                  {category.imageUrl ? <Image src={category.imageUrl} alt={category.name} fill priority={index < 2} sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><ShoppingBasket className="h-10 w-10 text-brand-green" aria-hidden="true" /></div>}
                </div>
                <div className="p-4 md:p-5">
                  <h2 className="text-lg font-semibold text-brand-green">{category.name}</h2>
                  {category.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-green">Browse <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
