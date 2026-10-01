
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

import { HeartHandshake, PackageCheck, Sprout, Store } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { Product } from "@/models/product";

interface HomemadeContentProps {
  products: Product[];
}

const values = [
  {
    title: "Small-batch by design",
    description: "Thoughtful, limited-run products made with the attention and character of independent kitchens.",
    icon: PackageCheck,
  },
  {
    title: "Built around makers",
    description: "FreshPick treats local producers as part of the network, not as anonymous inventory behind a supermarket shelf.",
    icon: HeartHandshake,
  },
  {
    title: "Rooted in Sri Lanka",
    description: "Familiar ingredients, honest methods and local food stories presented with the context they deserve.",
    icon: Sprout,
  },
];

export default function HomemadeContent({ products }: HomemadeContentProps) {
  return (
    <div className="min-h-screen bg-background text-zinc-900">
      <PremiumPageHeader title="Local makers" subtitle="Small-batch food and everyday favourites from independent Sri Lankan makers." />

      <section id="maker-collection" className="py-8 md:py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-6 grid gap-7 md:grid-cols-[1fr_0.62fr] md:items-end">
            <div>
              <span className="text-xs font-bold normal-case text-emerald-700">Live maker catalogue</span>
              <h2 className="mt-5 text-balance font-sans text-2xl font-semibold leading-tight text-zinc-950 md:text-2xl">Independent food, presented properly.</h2>
            </div>
            <p className="max-w-xl text-sm font-normal leading-7 text-zinc-600 md:justify-self-end">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? "maker product is" : "maker products are"} currently available through FreshPick.`
                : "The next group of local maker products is being prepared for the catalogue."}
            </p>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5" />
          ) : (
            <div className="flex min-h-0 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-background px-6 text-center">
              <Store className="mb-4 h-8 w-8 text-emerald-800" />
              <p className="font-sans text-3xl font-normal text-zinc-950">The maker network is being curated.</p>
              <p className="mt-3 max-w-md text-sm font-normal leading-7 text-zinc-500">New independent products will appear here as partnerships are approved and catalogue-ready.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-background py-8 md:py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-6">
            <span className="text-xs font-bold normal-case text-emerald-700">The FreshPick maker standard</span>
            <h2 className="mt-5 max-w-4xl text-balance font-sans text-2xl font-semibold leading-tight text-zinc-950 md:text-2xl">Not an open marketplace. A curated network.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {values.map(({ title, description, icon: Icon }, index) => (
              <article key={title} className="flex min-h-0 flex-col rounded-xl border border-zinc-200/80 bg-background p-7 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-emerald-900 ring-1 ring-zinc-200">
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </span>
                  <span className="text-xs font-bold normal-case text-muted-foreground">0{index + 1}</span>
                </div>
                <div className="mt-auto pt-6">
                  <h3 className="font-sans text-3xl font-semibold text-zinc-950">{title}</h3>
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
