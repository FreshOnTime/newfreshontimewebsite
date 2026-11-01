import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('FreshPick homepage editorial layout', () => {
  it('keeps catalogue cards, real category routes and the main commerce paths', () => {
    const page = read('app/page.tsx');
    expect(page).toContain('<HeroSection />');
    expect(page).toContain('<CategoryBento categories={categories} />');
    expect(page).toContain('<ProductCard');
    expect(page).toContain('<HomeBasketFeature />');
    expect(page).toContain('<HomeJournal posts={journal} />');
    expect(page).toContain('loadStorefrontHome');
    expect(page).toContain('getHomeData()');
  });

  it('uses one high-impact, accessible image without slideshow controls', () => {
    const hero = read('components/home/HeroSection.tsx');
    expect(hero).toContain('src="/images/home/fresh-market-hero.webp"');
    expect(hero).toContain('priority');
    expect(hero).toContain('sizes="100vw"');
    expect(hero).toContain('<h1');
    expect(hero).toContain('href="/products"');
    expect(hero).toContain('href="/how-it-works"');
    expect(hero).not.toContain('useState');
    expect(hero).not.toContain('aria-roledescription="carousel"');
    expect(hero).not.toContain('setInterval(');
    expect(existsSync(join(process.cwd(), 'public/images/home/fresh-market-hero.webp'))).toBe(true);
  });

  it('does not fabricate published categories and keeps image tiles compact', () => {
    const category = read('components/home/CategoryBento.tsx');
    expect(category).toContain('ordered.slice(0, 6)');
    expect(category).toContain('xl:grid-cols-6');
    expect(category).toContain('encodeURIComponent(category.slug)');
    expect(category).toContain('fallbackCategories');
  });

  it('links the recurring feature to implemented pages without claiming card billing', () => {
    const feature = read('components/home/HomeBasketFeature.tsx');
    expect(feature).toContain('href="/subscriptions"');
    expect(feature).toContain('href="/how-it-works/customers"');
    expect(feature).toContain('no automatic card billing');
    expect(existsSync(join(process.cwd(), 'public/images/home/market-bag.webp'))).toBe(true);
  });

  it('limits homepage blog cards and avoids the oversized second hero', () => {
    expect(read('components/home/HomeJournal.tsx')).toContain('posts.slice(0, 3)');
    expect(read('components/home/BrandStory.tsx')).not.toContain('min-h-[560px]');
  });
});
