import { publicPageMetadata } from '@/lib/publicPages';
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCategoryImage } from "@/lib/categoryImage";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

export const revalidate = 300;

export const metadata: Metadata = publicPageMetadata('/categories');

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
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl items-center gap-2 px-5 pt-6 text-xs text-muted-foreground md:px-8"><Link href="/" className="inline-flex min-h-9 items-center hover:text-brand-green">Home</Link><ChevronRight className="h-3 w-3" aria-hidden="true" /><span aria-current="page">Categories</span></nav>
      <PremiumPageHeader title="Shop by category" subtitle="Fresh produce, pantry staples, ready meals and more. Find your everyday favourites." />
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-6">
        {categories.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-10 text-center">
            <h2 className="font-serif text-2xl text-brand-green">Categories are being refreshed.</h2>
            <p className="mt-3 text-muted-foreground">You can still browse the full market.</p>
            <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-accent-foreground">Shop all products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
            {categories.map((category, index) => {
              const image = getCategoryImage(category.slug, category.imageUrl);
              return (
              <Link key={category.slug} href={`/categories/${encodeURIComponent(category.slug)}`} className="group flex flex-col rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border/60 bg-secondary">
                  <Image src={image} alt="" fill priority={index < 2} sizes="(max-width: 1023px) 50vw, 400px" className={image.split("?")[0].endsWith(".svg") ? "object-contain p-10 sm:p-16" : "object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"} />
                </div>
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div className="min-w-0"><h2 className="font-sans text-base font-medium tracking-[-0.01em] text-foreground md:text-xl">{category.name}</h2>
                  {category.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>}
                  <span className="mt-2 inline-block text-xs text-muted-foreground">Shop category</span></div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-brand-green transition-colors group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-primary-foreground"><ArrowRight strokeWidth={1.75} className="h-4 w-4" aria-hidden="true" /></span>
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
