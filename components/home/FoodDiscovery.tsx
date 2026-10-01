import Link from "next/link";
import { ArrowRight, ChefHat, HeartHandshake, Repeat2, Utensils } from "lucide-react";

const journeys = [
  { title: "Something to cook", description: "Find a recipe and shop the ingredients.", href: "/recipes", action: "Browse recipes", icon: ChefHat },
  { title: "Something ready", description: "Explore meals for days when you skip the cooking.", href: "/meals", action: "See ready meals", icon: Utensils },
  { title: "Something local", description: "Discover food from independent Sri Lankan makers.", href: "/homemade", action: "Meet the makers", icon: HeartHandshake },
  { title: "Your weekly staples", description: "Set up a recurring basket for your household essentials.", href: "/subscriptions", action: "Build a basket", icon: Repeat2 },
];

export default function FoodDiscovery() {
  return (
    <section className="border-t border-border bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="font-heading text-3xl font-semibold text-brand-green md:text-4xl">What&apos;s on the menu?</h2>
        <p className="mt-3 text-muted-foreground">A little inspiration for the way you eat.</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journeys.map(({ title, description, href, action, icon: Icon }) => (
            <Link key={href} href={href} className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand-green">
              <Icon className="h-6 w-6 text-brand-green" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-brand-green">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-brand-green">{action} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
