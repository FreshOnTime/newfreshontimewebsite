import Link from "next/link";
import { ArrowUpRight, HeartHandshake, Repeat2, ShoppingBasket, Soup } from "lucide-react";

const pathways = [
  {
    eyebrow: "Fresh today",
    title: "Groceries at their best",
    description: "Seasonal produce and kitchen essentials selected for the way Colombo shops and cooks.",
    href: "/products",
    action: "Shop fresh groceries",
    number: "01",
    icon: ShoppingBasket,
  },
  {
    eyebrow: "Meals on Deals",
    title: "Good food, made easy",
    description: "Order cooked-food favourites for today, or add them to your regular delivery schedule.",
    href: "/meals",
    action: "Explore meals",
    number: "02",
    icon: Soup,
  },
  {
    eyebrow: "Your routine, delivered",
    title: "Set it once, relax after",
    description: "Create a recurring grocery or meal order, then pause or adjust it whenever life changes.",
    href: "/subscriptions",
    action: "Plan recurring delivery",
    number: "03",
    icon: Repeat2,
  },
  {
    eyebrow: "Made locally",
    title: "Support local makers",
    description: "Discover thoughtful small-batch favourites from independent Sri Lankan food makers.",
    href: "/homemade",
    action: "Meet the makers",
    number: "04",
    icon: HeartHandshake,
  },
];

export default function FreshPickPathways() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 grid gap-7 md:mb-16 md:grid-cols-[1fr_0.75fr] md:items-end">
          <div>
            <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">Made for real life</span>
            <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight text-zinc-950 md:text-7xl">
              Shop FreshPick <span className="italic text-emerald-900">your way.</span>
            </h2>
          </div>
          <p className="max-w-xl text-base font-light leading-7 text-zinc-600 md:justify-self-end">
            Come for tonight&apos;s dinner, a weekly basket, a local discovery, or the everyday staples you never want to run out of.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pathways.map(({ eyebrow, title, description, href, action, number, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-[#fafaf8] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/60 hover:shadow-[0_20px_60px_rgba(6,78,59,0.08)] md:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-sm ring-1 ring-zinc-200 transition-all group-hover:bg-emerald-900 group-hover:text-white group-hover:ring-emerald-900">
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                </div>
                <span className="font-serif text-sm italic text-zinc-400">{number}</span>
              </div>

              <div className="mt-12">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</span>
                <h3 className="mt-4 font-serif text-3xl font-normal leading-[1.02] text-zinc-950">{title}</h3>
                <p className="mt-4 text-sm font-light leading-7 text-zinc-600">{description}</p>
              </div>

              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-900 transition-colors group-hover:text-emerald-800">
                {action}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
