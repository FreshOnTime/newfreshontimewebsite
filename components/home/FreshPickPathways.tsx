import Link from "next/link";
import { ArrowRight } from "lucide-react";

const pathways = [
  {
    eyebrow: "Fresh today",
    title: "Groceries at their best",
    description: "Seasonal produce and kitchen essentials selected for the way Colombo shops and cooks.",
    href: "/products",
    action: "Shop fresh groceries",
    number: "01",
  },
  {
    eyebrow: "Meals on Deals",
    title: "Good food, made easy",
    description: "Order cooked-food favourites for today, or add them to your regular delivery schedule.",
    href: "/meals",
    action: "Explore meals",
    number: "02",
  },
  {
    eyebrow: "Your routine, delivered",
    title: "Set it once, relax after",
    description: "Create a recurring grocery or meal order, then pause or adjust it whenever life changes.",
    href: "/subscriptions",
    action: "Plan recurring delivery",
    number: "03",
  },
  {
    eyebrow: "Made locally",
    title: "Support local makers",
    description: "Discover thoughtful small-batch favourites from independent Sri Lankan food makers.",
    href: "/homemade",
    action: "Meet the makers",
    number: "04",
  },
];

export default function FreshPickPathways() {
  return (
    <section className="bg-white py-24 md:py-36">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 grid gap-8 md:grid-cols-[1fr_0.75fr] md:items-end md:mb-24">
          <div>
          <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.34em] text-[#8b6d32]">A house of fresh</span>
          <h2 className="font-serif text-5xl font-normal leading-[0.95] text-[#142019] md:text-7xl">
            Four ways to live <span className="italic text-emerald-800">well.</span>
          </h2>
          </div>
          <p className="max-w-xl text-base font-light leading-8 text-zinc-500 md:justify-self-end">
            One considered destination for fresh groceries, independent makers, prepared meals, and recurring delivery.
          </p>
        </div>

        <div className="grid border-y border-zinc-200 md:grid-cols-2 lg:grid-cols-4">
          {pathways.map(({ eyebrow, title, description, href, action, number }, index) => (
            <Link
              key={title}
              href={href}
              className={`group flex min-h-[360px] flex-col px-5 py-10 transition-colors duration-500 hover:bg-[#f5f1e8] md:px-8 md:py-12 ${index > 0 ? "border-t border-zinc-200 md:border-l md:border-t-0" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm italic text-[#a07e3e]">{number}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">{eyebrow}</span>
              </div>
              <h3 className="mt-16 font-serif text-3xl font-normal leading-tight text-[#142019]">{title}</h3>
              <p className="mt-5 text-sm font-light leading-7 text-zinc-500">{description}</p>
              <span className="mt-auto inline-flex items-center pt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                {action} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
