import Link from "next/link";
import {
  ArrowUpRight,
  HeartHandshake,
  PackageCheck,
  Sparkles,
  Sprout,
  Store,
  UsersRound,
} from "lucide-react";
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

const networkRows = [
  ["Partner type", "Independent maker"],
  ["Discovery", "Story-led"],
  ["Commerce", "FreshPick checkout"],
  ["Curation", "Selective onboarding"],
];

export default function HomemadeContent({ products }: HomemadeContentProps) {
  return (
    <div className="min-h-screen bg-[#f4f6f2] text-zinc-900">
      <section className="relative isolate overflow-hidden bg-[#07100b] px-4 pb-20 pt-28 text-white md:px-8 md:pb-28 md:pt-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_14%,rgba(52,211,153,0.17),transparent_30%),radial-gradient(circle_at_86%_60%,rgba(163,230,53,0.07),transparent_24%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200">
                <Store className="h-3.5 w-3.5" /> FreshPick maker network
              </span>
              <h1 className="mt-7 max-w-5xl text-balance font-serif text-6xl font-normal leading-[0.88] tracking-[-0.048em] md:text-8xl lg:text-[7rem]">
                Local food with the people <span className="italic text-emerald-200">still attached.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">
                Discover independent Sri Lankan makers through a curated FreshPick network that keeps provenance, story and product context visible all the way to checkout.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#maker-collection" className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#07100b] transition-colors hover:bg-emerald-50">
                  Explore local makers <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/b2b" className="inline-flex h-14 items-center gap-3 rounded-full border border-white/12 bg-white/[0.045] px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white">
                  Become a partner
                </Link>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.23em] text-emerald-200">Maker profile</p>
                  <p className="mt-2 text-sm font-light text-white/42">The network layer behind discovery.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 ring-1 ring-emerald-300/10">
                  <UsersRound className="h-4 w-4 text-emerald-200" />
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {networkRows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/10 px-3.5 py-3 text-xs">
                    <span className="text-white/35">{label}</span>
                    <span className="text-white/68">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-300/[0.07] px-3.5 py-3 text-[9px] font-bold uppercase tracking-[0.17em] text-emerald-200 ring-1 ring-emerald-300/10">
                <Sparkles className="h-3.5 w-3.5" /> Commerce with provenance
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="maker-collection" className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.62fr] md:items-end">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">Live maker catalogue</span>
              <h2 className="mt-5 text-balance font-serif text-5xl font-normal leading-[0.95] tracking-[-0.035em] text-zinc-950 md:text-7xl">Independent food, presented properly.</h2>
            </div>
            <p className="max-w-xl text-sm font-light leading-7 text-zinc-600 md:justify-self-end">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? "maker product is" : "maker products are"} currently available through FreshPick.`
                : "The next group of local maker products is being prepared for the catalogue."}
            </p>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5" />
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-zinc-300 bg-white px-6 text-center shadow-[0_18px_60px_rgba(10,30,18,0.035)]">
              <Store className="mb-4 h-8 w-8 text-emerald-800" />
              <p className="font-serif text-3xl font-normal text-zinc-950">The maker network is being curated.</p>
              <p className="mt-3 max-w-md text-sm font-light leading-7 text-zinc-500">New independent products will appear here as partnerships are approved and catalogue-ready.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12">
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">The FreshPick maker standard</span>
            <h2 className="mt-5 max-w-4xl text-balance font-serif text-5xl font-normal leading-[0.95] tracking-[-0.035em] text-zinc-950 md:text-7xl">Not an open marketplace. A curated network.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {values.map(({ title, description, icon: Icon }, index) => (
              <article key={title} className="flex min-h-[310px] flex-col rounded-[1.75rem] border border-zinc-200/80 bg-[#f7f8f6] p-7 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-900 ring-1 ring-zinc-200">
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">0{index + 1}</span>
                </div>
                <div className="mt-auto pt-12">
                  <h3 className="font-serif text-3xl font-normal tracking-[-0.02em] text-zinc-950">{title}</h3>
                  <p className="mt-4 text-sm font-light leading-7 text-zinc-500">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
