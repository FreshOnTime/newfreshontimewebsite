import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("FreshPick editorial homepage", () => {
  it("retains database-backed products and existing shopping journeys", () => {
    const page = read("app/page.tsx");
    for (const marker of [
      "<HeroSection />",
      "<HomeMarketManifesto />",
      "<CategoryBento categories={categories} />",
      "<ProductCard",
      "<HomeBasketFeature />",
      "<HomeJournal posts={journal} />",
      "loadStorefrontHome",
      "getHomeData()",
    ]) expect(page).toContain(marker);
  });

  it("features a produce-box subscription hero with an accessible, real checkout journey", () => {
    const hero = read("components/home/HeroSection.tsx");
    expect(hero).toContain("The FreshPick Box.");
    expect(hero).toContain("Explore subscription boxes");
    expect(hero).toContain('href="/subscriptions"');
    expect(hero).toContain('href="/products"');
    expect(hero).toContain("SUBSCRIPTION_BOX_PHOTO");
    expect(hero).toContain("/images/home/market-produce-box.webp");
    expect(hero).toContain('sizes="100vw"');
    expect(hero).toContain("priority");
    expect(hero).toContain('aria-labelledby="home-hero-heading"');
    expect(hero).toContain('id="home-hero-heading"');
    expect(hero).toContain("bg-gradient-to-t");
    expect(existsSync(join(process.cwd(), "public/images/home/market-produce-box.webp"))).toBe(true);
    expect(hero).not.toContain("images.unsplash.com/photo-1595275522477-c3ce3ca9714b");
    expect(hero).not.toContain("useState");
    expect(hero).not.toContain("setInterval(");
    expect(hero).not.toContain("marketSelections.map");
    expect(hero).not.toContain('aria-roledescription="carousel"');
  });

  it("shows real approved categories and safe search fallbacks across the full food market", () => {
    const category = read("components/home/CategoryBento.tsx");
    expect(category).toContain("ordered.slice(0, 6)");
    expect(category).toContain("lg:grid-cols-6");
    expect(category).toContain("encodeURIComponent(category.slug)");
    expect(category).toContain("fallbackCategories");
    for (const text of ["Bakery", "Ready meals", "Dairy & eggs", "Pantry", "Beverages"]) {
      expect(category).toContain(text);
    }
  });

  it("keeps marketing claims and links grounded in existing features", () => {
    const feature = read("components/home/HomeBasketFeature.tsx");
    expect(feature).toContain('href="/subscriptions"');
    expect(feature).toContain("no automatic card billing");
    expect(read("components/home/HomeMarketManifesto.tsx")).toContain('href="/farm-to-table"');
    expect(read("components/home/BrandStory.tsx")).toContain('href="/b2b"');
    for (const name of ["kitchen-basket.webp", "hands-at-work.webp", "restaurant-kitchen.webp"]) {
      expect(existsSync(join(process.cwd(), "public/images/editorial", name))).toBe(true);
    }
  });

  it("shows no more than three published journal cards", () => {
    const journal = read("components/home/HomeJournal.tsx");
    expect(journal).toContain("posts.slice(0, 3)");
    expect(journal).toContain("Explore the journal");
  });
});
