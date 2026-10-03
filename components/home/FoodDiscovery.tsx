import Link from "next/link";
import { ArrowRight, ShoppingBasket, HeartHandshake, Repeat2, Utensils } from "lucide-react";

const journeys = [
  { title: "The market", description: "Shop food, drinks and everyday essentials by category.", href: "/categories", action: "Explore categories", icon: ShoppingBasket },
  { title: "Ready meals", description: "Explore meals for days when you skip the cooking.", href: "/meals", action: "See ready meals", icon: Utensils },
  { title: "Local makers", description: "Discover food from independent Sri Lankan makers.", href: "/homemade", action: "Meet the makers", icon: HeartHandshake },
  { title: "Weekly baskets", description: "Set up a recurring basket for your household essentials.", href: "/subscriptions", action: "Build a basket", icon: Repeat2 },
];

export default function FoodDiscovery() {
  return (
    <section className="border-t border-border bg-background py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="text-2xl font-normal text-foreground">More ways to shop</h2>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journeys.map(({ title, description, href, action }) => (
            <Link key={href} href={href} className="group flex flex-col border-t border-border py-6 transition-colors hover:border-brand-green">

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
