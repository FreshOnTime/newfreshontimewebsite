import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBasket } from "lucide-react";

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }

export default function CategoryBento({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="border-y border-border py-4 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <h2 id="categories-title" className="text-sm font-semibold text-brand-green">Shop by category</h2>
          <Link href="/categories" className="inline-flex min-h-11 items-center gap-2 text-sm text-brand-green hover:underline">View all <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <ul className="mt-3 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-4 lg:grid-cols-6">
          {categories.slice(0, 6).map((category) => (
            <li key={category.slug} className="w-28 shrink-0 md:w-auto">
              <Link href={`/categories/${category.slug}`} className="group flex h-full flex-col items-center gap-3 rounded-lg py-1 text-center md:flex-row md:gap-3 md:text-left">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary transition-colors group-hover:bg-brand-green/15">
                  {category.imageUrl ? <Image src={category.imageUrl} alt="" fill sizes="56px" className={category.imageUrl.split("?")[0].endsWith(".svg") ? "object-contain p-3" : "object-cover"} /> : <ShoppingBasket className="h-6 w-6 text-brand-green" aria-hidden="true" />}
                </div>
                <span className="text-sm font-medium leading-5 text-brand-green group-hover:underline">{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
