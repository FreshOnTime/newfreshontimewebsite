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

  it('shows multiple FreshPick categories rather than a produce-only slideshow', () => {
    const hero = read('components/home/HeroSection.tsx');
    expect(hero).toContain('marketSelections.map');
    expect(hero).toContain('aria-label="Explore FreshPick by food type"');
    expect(hero).toContain('href="/products"');
    expect(hero).toContain('href="/how-it-works"');
    expect(hero).toContain('A whole market.');
    expect(hero).not.toContain('setInterval(');
    expect(hero).not.toContain('useState');
    expect(hero).not.toContain('aria-roledescription="carousel"');
    for (const path of [
      'public/images/categories/cooked-food.webp',
      'public/images/categories/bakery.webp',
      'public/images/categories/pantry-staples.webp',
      'public/images/categories/dairy-eggs.webp',
      'public/images/categories/beverages.webp',
      'public/images/editorial/market-crates.webp',
    ]) {
      expect(existsSync(join(process.cwd(), path))).toBe(true);
    }
    for (const name of ['Ready meals', 'Bakery', 'Pantry staples', 'Fresh produce', 'Dairy & eggs', 'Beverages']) {
      expect(hero).toContain(name);
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
