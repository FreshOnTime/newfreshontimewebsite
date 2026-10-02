import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCategoryImage } from "@/lib/categoryImage";
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
    <div className="bg-background pb-10">
      <PremiumPageHeader title="Shop by category" subtitle="Fresh produce, pantry staples, ready meals and more. Find your everyday favourites." />
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-6">
        {categories.length === 0 ? (
          <section className="rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="font-sans text-2xl text-brand-green">Categories are being refreshed.</h2>
            <p className="mt-3 text-muted-foreground">You can still browse the full market.</p>
            <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-amber px-6 py-3 font-semibold text-accent-foreground">Shop all products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-3">
            {categories.map((category, index) => {
              const image = getCategoryImage(category.slug, category.imageUrl);
              return (
              <Link key={category.slug} href={`/categories/${encodeURIComponent(category.slug)}`} className="group flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <Image src={image} alt="" fill priority={index < 2} sizes="96px" className={image.split("?")[0].endsWith(".svg") ? "object-contain p-5" : "object-cover"} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-medium text-brand-green group-hover:underline">{category.name}</h2>
                  {category.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-green">Browse <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
