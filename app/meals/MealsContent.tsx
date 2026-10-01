
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import Link from "next/link";
import { CalendarDays, ChefHat, Clock3, Repeat } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Product } from "@/models/product";

interface MealsContentProps {
  products: Product[];
}

const benefits = [
  {
    icon: ChefHat,
    title: "Ready when cooking is not",
    description: "FreshPick treats prepared food as one mode inside the same food experience, not a disconnected catalogue.",
  },
  {
    icon: CalendarDays,
    title: "Choose for today",
    description: "Order individual meals or compose a basket for the household from what is currently available.",
  },
  {
    icon: Repeat,
    title: "Make favourites recurring",
    description: "Use the recurring-order flow at checkout when a meal belongs in your regular routine.",
  },
  {
    icon: Clock3,
    title: "Control the rhythm",
    description: "Manage, pause or end recurring orders from the FreshPick account instead of contacting support for every change.",
  },
];

export default function MealsContent({ products }: MealsContentProps) {
  return (
    <div className="min-h-screen bg-background text-zinc-900">
      <PremiumPageHeader title="Ready meals" subtitle="Find something ready to eat for today or your regular weekly order." />

      <section id="ready-menu" className="py-8 md:py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-6 grid gap-7 md:grid-cols-[1fr_0.6fr] md:items-end">
            <div>
              <span className="text-xs font-bold normal-case text-emerald-700">Live ready menu</span>
              <h2 className="mt-5 text-balance font-sans text-2xl font-semibold leading-tight text-zinc-950 md:text-2xl">What is ready now.</h2>
            </div>
            <p className="max-w-xl text-sm font-normal leading-7 text-zinc-600 md:justify-self-end">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? "meal is" : "meals are"} currently available through the FreshPick catalogue.`
                : "The next set of prepared meals is being readied for the catalogue."}
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5" />
              <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-xl border border-emerald-900/10 bg-emerald-50/70 p-6 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold normal-case text-emerald-700">Recurring ready mode</p>
                  <h3 className="mt-2 font-sans text-2xl font-semibold text-emerald-950">Want favourite meals on a regular rhythm?</h3>
                  <p className="mt-2 max-w-2xl text-sm font-normal leading-7 text-emerald-900/65">Add meals to the bag, then enable recurring order at checkout and choose the available delivery frequency.</p>
                </div>
                <Button asChild className="shrink-0 rounded-full bg-emerald-950 px-6 hover:bg-brand-amber">
                  <Link href="/bags">Open basket</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-background px-6 text-center">
              <ChefHat className="mb-4 h-8 w-8 text-emerald-800" />
              <p className="font-sans text-3xl font-normal text-zinc-950">The ready menu is being prepared.</p>
              <p className="mt-3 max-w-md text-sm font-normal leading-7 text-zinc-500">Cooked-food favourites will appear here as soon as they are available.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-background py-8 md:py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-6">
            <span className="text-xs font-bold normal-case text-emerald-700">How ready mode fits</span>
            <h2 className="mt-5 max-w-4xl text-balance font-sans text-2xl font-semibold leading-tight text-zinc-950 md:text-2xl">Convenience without leaving the FreshPick system.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="flex min-h-0 flex-col rounded-xl border border-zinc-200/80 bg-background p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-emerald-900 ring-1 ring-zinc-200">
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </span>
                  <span className="text-xs font-bold normal-case text-muted-foreground">0{index + 1}</span>
                </div>
                <div className="mt-auto pt-10">
                  <h3 className="font-sans text-2xl font-semibold text-zinc-950">{title}</h3>
                  <p className="mt-4 text-sm font-normal leading-7 text-zinc-500">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
