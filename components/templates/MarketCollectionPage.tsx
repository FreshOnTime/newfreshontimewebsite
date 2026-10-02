import Link from 'next/link';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import ProductGrid from '@/components/products/ProductGrid';
import type { Product } from '@/models/product';

interface MarketCollectionPageProps {
  products: Product[];
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  selectionTitle: string;
  emptyCopy: string;
  notes: Array<{title: string; description: string}>;
}

/** A photography-led introduction followed by the live collection, without decorative feature cards. */
export default function MarketCollectionPage({products, title, eyebrow, description, image, selectionTitle, emptyCopy, notes}: MarketCollectionPageProps) {
  return <div>
    <PremiumPageHeader title={title} eyebrow={eyebrow} subtitle={description} backgroundImage={image} />
    <section className="editorial-wrap editorial-section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><h2 className="editorial-title">{selectionTitle}</h2><p className="text-xs text-muted-foreground">{products.length} {products.length === 1 ? 'item' : 'items'} available</p></div>
      {products.length > 0 ? <ProductGrid products={products} /> : <div className="border-y border-border py-12"><p className="max-w-xl text-base leading-7 text-muted-foreground">{emptyCopy}</p><Link href="/products" className="editorial-link mt-6">Browse the full market</Link></div>}
    </section>
    <section className="editorial-wrap pb-12 md:pb-20"><div className="divide-y divide-border border-y border-border">{notes.map(({title: noteTitle, description: copy}, index)=><article key={noteTitle} className="grid gap-3 py-6 md:grid-cols-[60px_1fr_1.4fr] md:gap-8"><span className="text-xs text-muted-foreground">0{index+1}</span><h3 className="font-serif text-2xl font-normal text-brand-green">{noteTitle}</h3><p className="text-sm leading-7 text-muted-foreground">{copy}</p></article>)}</div></section>
  </div>;
}
