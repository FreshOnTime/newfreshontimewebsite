import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("FreshPick homepage editorial layout", () => {
  it("retains live catalogue products, categories and essential customer routes", () => {
    const page = read("app/page.tsx");
    expect(page).toContain("<HeroSection />");
    expect(page).toContain("<CategoryBento categories={categories} />");
    expect(page).toContain("<ProductCard");
    expect(page).toContain("<HomeBasketFeature />");
    expect(page).toContain("<HomeJournal posts={journal} />");
    expect(page).toContain("loadStorefrontHome");
    expect(page).toContain("getHomeData()");
  });

  it("renders a single accessible premium marketplace photo instead of a collage or carousel", () => {
    const hero = read("components/home/HeroSection.tsx");
    expect(hero).toContain("A whole market.");
    expect(hero).toContain("For every table.");
    expect(hero).toContain('href="/products"');
    expect(hero).toContain('href="/how-it-works"');
    expect(hero).toContain("MARKET_HERO_PHOTO");
    expect(hero).toContain("images.unsplash.com/photo-1595275522477-c3ce3ca9714b");
    expect(hero).toContain("alt=\"A selection of groceries");
    expect(hero).toContain("priority");
    expect(hero).toContain("sizes=");
    expect(hero).not.toContain("useState");
    expect(hero).not.toContain("setInterval(");
    expect(hero).not.toContain("marketSelections.map");
    expect(hero).not.toContain("aria-roledescription=\"carousel\"");
    const nextConfig = read("next.config.ts");
    expect(nextConfig).toContain("images.unsplash.com");
  });

  it("uses real category routes and balanced responsive category tiles", () => {
    const categories = read("components/home/CategoryBento.tsx");
    expect(categories).toContain("ordered.slice(0, 6)");
    expect(categories).toContain("xl:grid-cols-6");
    expect(categories).toContain("encodeURIComponent(category.slug)");
    expect(categories).toContain("fallbackCategories");
  });

  it("links recurring shopping to existing pages without claiming card billing", () => {
    const feature = read("components/home/HomeBasketFeature.tsx");
    expect(feature).toContain('href="/subscriptions"');
    expect(feature).toContain('href="/how-it-works/customers"');
    expect(feature).toContain("no automatic card billing");
  });

  it("limits editorial articles and avoids a second oversized hero", () => {
    expect(read("components/home/HomeJournal.tsx")).toContain("posts.slice(0, 3)");
    expect(read("components/home/BrandStory.tsx")).not.toContain("min-h-[560px]");
  });
});
