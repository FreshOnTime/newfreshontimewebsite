import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, Sparkles } from "lucide-react";
import FoodDiscovery from "@/components/home/FoodDiscovery";

export const metadata: Metadata = {
  title: "Discover What to Eat | FreshPick Colombo",
  description: "Start with the meal, moment or routine. FreshPick Discover connects what you want to eat with shoppable recipes, groceries, ready meals and local makers in Colombo.",
  alternates: { canonical: "https://freshpick.lk/discover" },
};

const startingPoints = [
  {
    label: "I need dinner",
    copy: "Pick the dish first, then add the available ingredients for the whole meal to your basket in one action.",
    href: "/recipes",
  },
  {
    label: "I want something ready",
    copy: "Prepared food for the days when the kitchen can stay quiet.",
    href: "/meals",
  },
  {
    label: "I want to discover something new",
    copy: "Explore independent Sri Lankan makers and small-batch favourites.",
    href: "/homemade",
  },
  {
    label: "I am stocking the week",
    copy: "Go directly to fresh groceries and everyday kitchen essentials.",
    href: "/products",
  },
];

export default function DiscoverPage() {
  return (
    <main className="overflow-hidden bg-white">
      <section className="relative overflow-hidden bg-[#08130d] px-4 pb-24 pt-28 text-white md:px-8 md:pb-32 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(110,231,183,0.14),transparent_28%),radial-gradient(circle_at_86%_35%,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="container relative mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-200">
              <Compass className="h-3.5 w-3.5" /> FreshPick Discover
            </span>
            <h1 className="text-balance font-serif text-6xl font-normal leading-[0.9] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[7rem]">
              Discover what to eat.<br />
              <span className="italic text-emerald-200">Get everything to make it.</span>
            </h1>
            <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,680px)_auto] lg:items-end">
              <p className="max-w-2xl text-base font-light leading-8 text-white/65 md:text-lg">
                FreshPick starts with your intent — dinner tonight, something ready, a local discovery, or the weekly routine — and takes you directly to the food that fits.
              </p>
              <Link
                href="/recipes"
                className="group inline-flex h-14 w-fit items-center gap-3 rounded-full bg-white px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-[#07110c] transition-all hover:-translate-y-0.5 hover:bg-emerald-50 lg:justify-self-end"
              >
                Find dinner <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f7f4] py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Start here
              </span>
              <h2 className="font-serif text-4xl font-normal tracking-tight text-zinc-950 md:text-6xl">What sounds right today?</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {startingPoints.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex min-h-[240px] flex-col rounded-[1.75rem] border border-zinc-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_60px_rgba(6,78,59,0.08)] md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-serif text-sm italic text-zinc-400">0{index + 1}</span>
                  <ArrowUpRight className="h-5 w-5 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </div>
                <div className="mt-auto pt-12">
                  <h3 className="font-serif text-3xl font-normal leading-tight text-zinc-950">{item.label}</h3>
                  <p className="mt-4 max-w-lg text-sm font-light leading-7 text-zinc-600">{item.copy}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FoodDiscovery />
    </main>
  );
}
