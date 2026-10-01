import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Site Map",
  description: "Find your way around FreshPick: groceries, recipes, local makers, account pages and support.",
};

const sections = [
  { title: "Shop", links: [["Home", "/"], ["All products", "/products"], ["Categories", "/categories"], ["Offers", "/deals"], ["Weekly baskets", "/subscriptions"], ["Ready meals", "/meals"], ["Local makers", "/homemade"]] },
  { title: "Discover", links: [["Discover food", "/discover"], ["Recipes", "/recipes"], ["Collections", "/collections"], ["Creators", "/creators"], ["Journal", "/blog"], ["Search", "/search"]] },
  { title: "Your account", links: [["Sign in", "/auth/login"], ["Create an account", "/auth/signup/customer"], ["Shopping bags", "/bags"], ["Wishlist", "/wishlist"], ["Orders", "/orders"], ["Profile", "/profile"]] },
  { title: "FreshPick", links: [["Our story", "/about"], ["Partner with us", "/b2b"], ["Contact", "/contact"], ["Delivery & ordering help", "/help"], ["Feedback", "/help-us"]] },
  { title: "Information", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookie Policy", "/cookies"], ["Returns & refunds", "/refund"]] },
];

async function getCategories() {
  try {
    return await prisma.category.findMany({ where: { isActive: true }, select: { name: true, slug: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  } catch {
    return [];
  }
}

export default async function SiteMapPage() {
  const categories = await getCategories();
  return (
    <main className="bg-background pb-12">
      <PremiumPageHeader title="Site map" subtitle="Everything at FreshPick, in one place." />
      <nav aria-label="Site directory" className="mx-auto grid max-w-7xl gap-x-10 gap-y-8 px-5 py-8 sm:grid-cols-2 md:px-8 md:py-10 lg:grid-cols-3">
        {sections.map(({ title, links }) => (
          <section key={title} className="border-t border-border pt-5">
            <h2 className="mb-3 text-lg font-medium text-brand-green">{title}</h2>
            <ul>{links.map(([label, href]) => <li key={href}><Link href={href} className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-brand-green hover:underline">{label}</Link></li>)}</ul>
          </section>
        ))}
        {categories.length > 0 && (
          <section className="border-t border-border pt-5">
            <h2 className="mb-3 text-lg font-medium text-brand-green">Market categories</h2>
            <ul>{categories.map(({ name, slug }) => <li key={slug}><Link href={`/categories/${encodeURIComponent(slug)}`} className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-brand-green hover:underline">{name}</Link></li>)}</ul>
          </section>
        )}
      </nav>
    </main>
  );
}
