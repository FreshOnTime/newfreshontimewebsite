import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  HeartHandshake,
  Repeat2,
  ShoppingBasket,
  Sparkles,
  Utensils,
} from "lucide-react";

const discoveryJourneys = [
  {
    eyebrow: "Tonight",
    title: "Dinner without the decision fatigue",
    description: "Start with meal kits and ready-to-cook ideas when you want a proper dinner without planning every ingredient yourself.",
    href: "/meal-kits",
    action: "Find tonight's dinner",
    icon: Clock3,
    className: "xl:col-span-7 bg-[#0b1710] text-white border-white/10",
    accent: "text-emerald-200",
    body: "text-white/65",
    ring: "bg-white/10 text-emerald-100 ring-white/10",
  },
  {
    eyebrow: "Already made",
    title: "Good food, ready when you are",
    description: "Explore prepared meals for the days when cooking is not the plan.",
    href: "/meals",
    action: "Explore ready meals",
    icon: Utensils,
    className: "xl:col-span-5 bg-[#f1e9dc] text-zinc-950 border-[#e6dbc9]",
    accent: "text-amber-800",
    body: "text-zinc-600",
    ring: "bg-white/70 text-amber-900 ring-amber-900/10",
  },
  {
    eyebrow: "Discover local",
    title: "Small-batch food worth knowing about",
    description: "Meet independent Sri Lankan makers and discover products that do not feel like another supermarket aisle.",
    href: "/homemade",
    action: "Meet local makers",
    icon: HeartHandshake,
    className: "xl:col-span-4 bg-[#f7f5f0] text-zinc-950 border-zinc-200",
    accent: "text-emerald-800",
    body: "text-zinc-600",
    ring: "bg-white text-emerald-900 ring-zinc-200",
  },
  {
    eyebrow: "Weekly rhythm",
    title: "Make the repeat shopping disappear",
    description: "Build a recurring basket for the things your home comes back to every week.",
    href: "/subscriptions",
    action: "Build a recurring basket",
    icon: Repeat2,
    className: "xl:col-span-4 bg-[#eef3ed] text-zinc-950 border-emerald-900/10",
    accent: "text-emerald-800",
    body: "text-zinc-600",
    ring: "bg-white/80 text-emerald-900 ring-emerald-900/10",
  },
  {
    eyebrow: "The market",
    title: "Know what you need? Go straight to it",
    description: "Browse fresh produce, pantry essentials and the full FreshPick collection when your list is already made.",
    href: "/products",
    action: "Shop the market",
    icon: ShoppingBasket,
    className: "xl:col-span-4 bg-white text-zinc-950 border-zinc-200",
    accent: "text-emerald-800",
    body: "text-zinc-600",
    ring: "bg-zinc-50 text-emerald-900 ring-zinc-200",
  },
];

export default function FoodDiscovery() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 grid gap-8 md:mb-16 md:grid-cols-[1fr_0.72fr] md:items-end">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Start with the appetite
            </span>
            <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight text-zinc-950 md:text-7xl">
              Don&apos;t shop aisles. <span className="italic text-emerald-900">Shop the moment.</span>
            </h2>
          </div>
          <div className="md:justify-self-end">
            <p className="max-w-xl text-base font-light leading-7 text-zinc-600">
              FreshPick is being built around what you want to eat, cook and repeat — then connects that intent to the groceries, meals and makers that make it happen.
            </p>
            <Link
              href="/discover"
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-950 transition-colors hover:text-emerald-700"
            >
              Open FreshPick Discover <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          {discoveryJourneys.map(({ eyebrow, title, description, href, action, icon: Icon, className, accent, body, ring }) => (
            <Link
              key={title}
              href={href}
              className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-[2rem] border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(10,30,18,0.10)] md:p-8 ${className}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`text-[9px] font-bold uppercase tracking-[0.24em] ${accent}`}>{eyebrow}</span>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${ring}`}>
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                </div>
              </div>

              <div className="mt-16 max-w-xl">
                <h3 className="max-w-lg font-serif text-3xl font-normal leading-[1.02] md:text-4xl">{title}</h3>
                <p className={`mt-5 max-w-lg text-sm font-light leading-7 ${body}`}>{description}</p>
              </div>

              <span className={`mt-auto inline-flex items-center gap-2 pt-8 text-[10px] font-bold uppercase tracking-[0.18em] ${accent}`}>
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
