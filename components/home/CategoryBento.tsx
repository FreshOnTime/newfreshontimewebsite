import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBasket } from "lucide-react";

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }

export default function CategoryBento({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section className="bg-background py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-sans text-2xl font-semibold text-brand-green">Shop by category</h2>
          <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline">All categories <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green">
              <div className="relative aspect-[4/3] bg-secondary">
                {category.imageUrl ? <Image src={category.imageUrl} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><ShoppingBasket className="h-10 w-10 text-brand-green" aria-hidden="true" /></div>}
              </div>
              <h3 className="p-4 text-sm font-semibold text-brand-green">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
