import { publicPageMetadata } from '@/lib/publicPages';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import FoodDiscovery from '@/components/home/FoodDiscovery';
import HomeJournal from '@/components/home/HomeJournal';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import { listPublishedJournalEntries } from '@/lib/journalService';
import { getTrendingProducts } from '@/lib/intelligence/tasteGraph';

export const revalidate = 60;
export const metadata: Metadata = publicPageMetadata('/discover');

export default async function DiscoverPage() {
  const [stories, trending] = await Promise.all([listPublishedJournalEntries().catch(() => []), getTrendingProducts(5).catch(() => [])]);
  return <div className="bg-background pb-10">
    <PremiumPageHeader title="A little food inspiration" subtitle="Everyday essentials, food made with care and stories from the market." backgroundImage="/images/home/market-bakery.webp" imageLayout="compact" />
    <FoodDiscovery />
    {trending.length > 0 && <section className="editorial-wrap editorial-section"><h2 className="editorial-title">Popular at the market</h2><p className="mt-3 text-muted-foreground">Favourites from recent FreshPick orders.</p><div className="mt-6 divide-y divide-border border-y border-border">{trending.map(item => <Link key={item.product._id} href={`/products/${item.product.sku}`} className="flex items-center justify-between gap-4 px-1 py-4 text-brand-green hover:bg-secondary"><span>{item.product.name}</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}</div></section>}
    <HomeJournal posts={stories} />
  </div>;
}
