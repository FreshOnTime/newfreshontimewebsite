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

  it('uses a manual hero carousel with accessible selectors and real shop links', () => {
    const hero = read('components/home/HeroSection.tsx');
    expect(hero).toContain('aria-roledescription="carousel"');
    expect(hero).toContain('aria-pressed={active === index}');
    expect(hero).toContain('onClick={() => goTo(-1)}');
    expect(hero).toContain('onClick={() => goTo(1)}');
    expect(hero).toContain('href={slide.href}');
    expect(hero).not.toContain('setInterval(');
    expect(hero).not.toContain('autoplay');
    for (const name of ['market-produce-box.webp', 'fresh-market-hero.webp', 'market-pantry.webp']) {
      expect(existsSync(join(process.cwd(), 'public/images/home', name))).toBe(true);
    }
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
