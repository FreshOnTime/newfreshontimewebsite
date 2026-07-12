import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ChefHat, Clock3, Repeat, Sparkles } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Product } from "@/models/product";

interface MealsContentProps {
  products: Product[];
}

const benefits = [
  {
    icon: ChefHat,
    title: "Made for today",
    description: "Freshly prepared favourites, ready when a home-cooked meal is the best plan.",
  },
  {
    icon: CalendarDays,
    title: "Order your way",
    description: "Choose one meal at a time or build a basket for the whole household.",
  },
  {
    icon: Repeat,
    title: "Make it recurring",
    description: "At checkout, set a weekly, monthly, or daily delivery schedule that works for you.",
  },
  {
    icon: Clock3,
    title: "Flexible delivery",
    description: "Manage, pause, or end your recurring order from your FreshPick account.",
  },
];

export default function MealsContent({ products }: MealsContentProps) {
  return (
    <div className="min-h-screen bg-transparent text-zinc-900">
      <section className="relative flex h-[80vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bgs/home-hero.jpg"
            alt="FreshPick cooked meals and groceries"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            // This local, pre-compressed asset avoids a remote image fetch on
            // the Meals page's Largest Contentful Paint.
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-white/10" />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-4 pt-20 text-center text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            FreshPick Meals on Deals
          </div>
          <h1 className="mb-8 font-serif text-6xl leading-[0.9] tracking-tight text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
            Good food,<br /><span className="italic text-emerald-100">made easy.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-zinc-100 drop-shadow-md md:text-2xl">
            Discover cooked-food favourites from FreshPick. Order whenever you want, or set a delivery schedule for meals you love.
          </p>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-80"><div className="h-16 w-px bg-gradient-to-b from-transparent via-white to-transparent" /></div>
      </section>

      <section className="relative bg-zinc-50 py-24 md:py-32">
        <div className="container mx-auto max-w-[1400px] px-4">
          <div className="relative z-20 -mt-32 grid grid-cols-1 gap-6 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }, index) => {
              const isFeatured = index === 1;
              return (
                <article key={title} className={`relative flex min-h-[340px] flex-col overflow-hidden border border-[#e4e4e7] p-8 text-center transition-all duration-500 md:p-10 ${isFeatured ? "z-20 bg-[#09090b] text-white shadow-2xl lg:-mt-4 lg:-mb-4" : "z-10 bg-white text-[#09090b]"}`}>
                  {isFeatured && <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />}
                  <Icon className={`mx-auto mb-6 h-7 w-7 ${isFeatured ? "text-emerald-400" : "text-emerald-700"}`} />
                  <h2 className="font-serif text-3xl">{title}</h2>
                  <p className={`mx-auto mt-4 max-w-[240px] text-sm font-light leading-relaxed ${isFeatured ? "text-zinc-400" : "text-zinc-500"}`}>{description}</p>
                  <div className={`my-7 border-t ${isFeatured ? "border-white/10" : "border-zinc-100"}`} />
                  <p className={`text-xs uppercase tracking-[0.16em] ${isFeatured ? "text-zinc-500" : "text-zinc-400"}`}>FreshPick meals</p>
                  <Link href="/products" className={`mt-auto inline-flex h-12 items-center justify-center text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${isFeatured ? "bg-[#d1fae5] text-[#09090b] hover:bg-white" : "bg-[#09090b] text-white hover:bg-emerald-900"}`}>Explore menu</Link>
                </article>
              );
            })}
          </div>

          <div className="mt-24">
            <div className="mb-10 flex flex-col gap-4 border-b border-zinc-100 pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Meals on Deals</span>
                <h2 className="font-serif text-4xl text-zinc-900 md:text-5xl">What&apos;s cooking</h2>
              </div>
              <p className="text-sm font-light text-zinc-500">
                {products.length} {products.length === 1 ? "meal" : "meals"} available
              </p>
            </div>

            {products.length > 0 ? (
              <>
                <ProductGrid
                  products={products}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
                />
                <div className="mt-10 flex flex-col items-start justify-between gap-5 border border-emerald-900/15 bg-emerald-50 p-6 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-serif text-2xl text-emerald-950">Want meals on a regular schedule?</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-emerald-800/80">
                      Add your meals to the bag, then enable <strong>Recurring Order</strong> at checkout and choose the delivery frequency.
                    </p>
                  </div>
                  <Button asChild className="shrink-0 bg-emerald-700 hover:bg-emerald-800">
                    <Link href="/bags">Go to bag</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 text-center">
                <ChefHat className="mb-4 h-8 w-8 text-emerald-700" />
                <p className="mb-3 font-serif text-2xl text-zinc-900">The menu is being prepared</p>
                <p className="max-w-md font-light leading-relaxed text-zinc-500">
                  Our next cooked-food favourites are on their way. Please check back soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
