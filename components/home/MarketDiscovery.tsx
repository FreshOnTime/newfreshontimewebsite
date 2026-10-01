import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const destinations = [
  { number: "01", title: "Something to cook", description: "Recipes with ingredients you can shop.", action: "Find a recipe", href: "/recipes" },
  { number: "02", title: "Something ready", description: "Meals for when someone else does the cooking.", action: "Explore ready meals", href: "/meals" },
  { number: "03", title: "A regular favourite", description: "Recurring baskets for your everyday essentials.", action: "Explore weekly baskets", href: "/subscriptions" },
];

export default function MarketDiscovery() {
  return (
    <section aria-labelledby="discovery-title" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="border-t border-border pt-8 md:grid md:grid-cols-[1fr_2fr] md:gap-16 md:pt-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Beyond the grocery list</p>
          <h2 id="discovery-title" className="mt-3 max-w-xs text-3xl font-medium leading-tight tracking-tight text-brand-green">What’s on<br className="hidden md:block" /> your table?</h2>
        </div>
        <div className="mt-6 divide-y divide-border md:mt-0">
          {destinations.map(({ number, title, description, action, href }) => (
            <Link key={href} href={href} className="group grid grid-cols-[1.5rem_1fr_auto] items-start gap-4 py-5 first:pt-0 md:gap-6">
              <span aria-hidden="true" className="pt-1 text-xs text-muted-foreground">{number}</span>
              <div>
                <h3 className="text-xl font-medium text-brand-green group-hover:underline">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                <span className="mt-3 block text-xs font-semibold text-brand-green">{action}</span>
              </div>
              <ArrowUpRight className="mt-1 h-5 w-5 text-brand-green" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
