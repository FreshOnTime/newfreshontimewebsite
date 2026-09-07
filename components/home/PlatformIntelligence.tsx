import Link from "next/link";
import { ArrowUpRight, BrainCircuit, ChefHat, RefreshCw, Sparkles, Store, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTrendingProducts } from "@/lib/intelligence/tasteGraph";

async function getPlatformPulse() {
  try {
    const [catalogue, inStock, recipes, plans, suppliers, trending] = await Promise.all([
      prisma.product.count({ where: { archived: false } }),
      prisma.product.count({ where: { archived: false, stockQty: { gt: 0 } } }),
      prisma.blog.count({ where: { category: "recipe", published: true, isDeleted: false } }),
      prisma.subscriptionPlan.count({ where: { isActive: true } }),
      prisma.supplier.count({ where: { status: "active" } }),
      getTrendingProducts(5),
    ]);
    return { catalogue, inStock, recipes, plans, suppliers, trending };
  } catch (error) {
    console.error("[Homepage] Failed to build platform pulse:", error);
    return { catalogue: 0, inStock: 0, recipes: 0, plans: 0, suppliers: 0, trending: [] as Awaited<ReturnType<typeof getTrendingProducts>> };
  }
}

const engines = [
  {
    icon: BrainCircuit,
    name: "Taste Graph",
    status: "Live",
    description: "Ranks categories and food tags from a customer’s real orders, active baskets and wishlist signals.",
    href: "/for-you",
  },
  {
    icon: RefreshCw,
    name: "Smart Basket",
    status: "Live",
    description: "Estimates replenishment timing from repeat-purchase intervals and can add predicted refills to the active basket.",
    href: "/for-you",
  },
  {
    icon: TrendingUp,
    name: "Demand Engine",
    status: "Live",
    description: "Uses eight weeks of order velocity to forecast next-week demand, stock cover and suggested reorder quantities.",
    href: "/b2b",
  },
  {
    icon: ChefHat,
    name: "Recipe Resolver",
    status: "Live",
    description: "Turns published recipes into baskets while checking stock and resolving editor-approved substitutions server-side.",
    href: "/recipes",
  },
];

export default async function PlatformIntelligence() {
  const pulse = await getPlatformPulse();
  const availability = pulse.catalogue > 0 ? Math.round((pulse.inStock / pulse.catalogue) * 100) : 0;

  return (
    <section className="border-y border-zinc-200 bg-[#f4f5f2] py-20 md:py-28">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Live product system
            </span>
            <h2 className="mt-5 max-w-3xl font-serif text-5xl font-normal leading-[0.96] tracking-tight text-zinc-950 md:text-7xl">
              Intelligence that does something.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600">
              FreshPick now calculates recommendations, replenishment timing and operations forecasts from real commerce data. When there is not enough data, the product says so instead of inventing a result.
            </p>
            <Link href="/for-you" className="mt-8 inline-flex items-center gap-2 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-900">
              Open your intelligence <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <dl className="grid grid-cols-2 border border-zinc-300 bg-white sm:grid-cols-5">
            {[
              ["Catalogue", pulse.catalogue.toLocaleString()],
              ["Available", `${availability}%`],
              ["Recipes", pulse.recipes.toLocaleString()],
              ["Recurring plans", pulse.plans.toLocaleString()],
              ["Suppliers", pulse.suppliers.toLocaleString()],
            ].map(([label, value], index) => (
              <div key={label} className={`p-5 ${index > 0 ? "border-l border-zinc-200" : ""}`}>
                <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</dt>
                <dd className="mt-3 text-2xl font-semibold tabular-nums text-zinc-950">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2 xl:grid-cols-4">
          {engines.map(({ icon: Icon, name, status, description, href }) => (
            <Link key={name} href={href} className="group bg-white p-6 transition-colors hover:bg-emerald-50/50">
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-5 w-5 text-emerald-800" />
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {status}</span>
              </div>
              <h3 className="mt-8 text-lg font-semibold text-zinc-950">{name}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-zinc-700">Open <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="border border-zinc-300 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-zinc-950">30-day demand signal</p>
                <p className="mt-1 text-xs text-zinc-400">Products ranked from actual order quantities</p>
              </div>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </div>
            {pulse.trending.length === 0 ? (
              <div className="px-5 py-8 text-sm text-zinc-500">No recent order activity yet. Trending products will appear automatically once real demand exists.</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {pulse.trending.map((item, index) => (
                  <Link key={item.product._id} href={`/products/${item.product.sku}`} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-5 py-4 hover:bg-zinc-50">
                    <span className="text-xs tabular-nums text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-medium text-zinc-800">{item.product.name}</span>
                    <span className="text-xs tabular-nums text-zinc-500">{item.units} units</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="border border-zinc-300 bg-[#0b1710] p-6 text-white">
            <Store className="h-5 w-5 text-emerald-200" />
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Behind the storefront</p>
            <h3 className="mt-3 font-serif text-3xl font-normal">The same data drives operations.</h3>
            <p className="mt-4 text-sm leading-6 text-white/60">Admin intelligence converts demand into stock-risk and reorder recommendations, while supplier health is calculated from current catalogue availability and real 30-day sales.</p>
            <Link href="/b2b" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-white">Partner with FreshPick <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </section>
        </div>
      </div>
    </section>
  );
}
