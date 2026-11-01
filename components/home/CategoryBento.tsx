import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategoryImage } from "@/lib/categoryImage";

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }

/** Show approved categories. When the database is empty, link to catalogue searches, not imaginary categories. */
const fallbackCategories = [
  { name: "Vegetables", href: "/products?search=vegetables", image: "/images/editorial/market-crates.webp" },
  { name: "Fruit", href: "/products?search=fruit", image: "/images/categories/fruits.webp" },
  { name: "Pantry", href: "/products?search=pantry", image: "/images/categories/pantry-staples.webp" },
  { name: "Bakery", href: "/products?search=bread", image: "/images/categories/bakery.webp" },
  { name: "Prepared food", href: "/products?search=cooked", image: "/images/categories/cooked-food.webp" },
  { name: "Beverages", href: "/products?search=beverages", image: "/images/categories/beverages.webp" },
];

export default function CategoryBento({ categories }: { categories: Category[] }) {
  const produce = categories.find(category => category.slug === "fresh-produce");
  const ordered = produce ? [produce, ...categories.filter(category => category !== produce)] : categories;
  const tiles = ordered.length
    ? ordered.slice(0, 6).map(category => ({
        name: category.name,
        href: "/categories/" + encodeURIComponent(category.slug),
        image: getCategoryImage(category.slug, category.imageUrl),
      }))
    : fallbackCategories;

  return (
    <section aria-labelledby="categories-title" className="editorial-wrap py-12 md:py-16">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 md:mb-8">
        <div>
          <p className="editorial-label mb-3">Find what you need</p>
          <h2 id="categories-title" className="editorial-title">Shop by category.</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Start with the ingredients and everyday essentials for your kitchen.</p>
        </div>
        <Link href="/categories" className="editorial-link">All categories <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      <nav aria-label="Featured categories" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-6">
        {tiles.map(tile => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group min-w-0 rounded-2xl border border-brand-green/10 bg-white/75 p-2.5 transition-[border-color,box-shadow,transform] duration-200 hover:border-brand-green/35 hover:shadow-[0_18px_40px_-28px_rgba(16,46,30,.38)] motion-safe:hover:-translate-y-1 sm:p-3"
          >
            <div className="relative aspect-[5/4] overflow-hidden rounded-xl bg-secondary">
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1279px) 33vw, 16vw"
                className={tile.image.split("?")[0].endsWith(".svg") ? "object-contain p-7" : "object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.035]"}
              />
            </div>
            <div className="flex min-h-14 items-center justify-between gap-2 px-1 pt-3">
              <h3 className="text-sm font-semibold leading-5 text-brand-green-deep sm:text-base">{tile.name}</h3>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </nav>
    </section>
  );
}
