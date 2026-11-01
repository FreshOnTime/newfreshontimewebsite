import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategoryImage } from "@/lib/categoryImage";

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }

// If an administrator has not activated categories yet, these lead to real catalogue searches.
const fallbackCategories = [
  { name: "Fresh produce", href: "/products?search=vegetables", image: "/images/editorial/market-crates.webp" },
  { name: "Bakery", href: "/products?search=bread", image: "/images/categories/bakery.webp" },
  { name: "Pantry", href: "/products?search=pantry", image: "/images/categories/pantry-staples.webp" },
  { name: "Ready meals", href: "/products?search=cooked", image: "/images/categories/cooked-food.webp" },
  { name: "Dairy & eggs", href: "/products?search=dairy", image: "/images/categories/dairy-eggs.webp" },
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
    <section aria-labelledby="categories-title" className="editorial-wrap py-14 md:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-brand-green-deep/20 pb-6 md:mb-10">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[.22em] text-brand-green">Shop your way</p>
          <h2 id="categories-title" className="font-heading text-[clamp(2.15rem,4vw,4.2rem)] font-semibold uppercase leading-none tracking-[-.06em] text-brand-green-deep">
            The whole market.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Explore the different foods and everyday essentials currently offered.</p>
        </div>
        <Link href="/categories" className="inline-flex min-h-11 items-center gap-2 border-b border-brand-green-deep text-xs font-semibold uppercase tracking-[.1em] text-brand-green-deep">
          All categories <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <nav aria-label="Featured food categories" className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-6">
        {tiles.map(tile => (
          <Link key={tile.href} href={tile.href} className="group min-w-0">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 17vw"
                className={tile.image.split("?")[0].endsWith(".svg")
                  ? "object-contain p-6"
                  : "object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]"}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-brand-green-deep/25 pt-3">
              <h3 className="text-sm font-semibold uppercase leading-5 tracking-[-.015em] text-brand-green-deep">{tile.name}</h3>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-green transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </nav>
    </section>
  );
}
