
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, PackageCheck, ShoppingBag, Sprout } from 'lucide-react';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata: Metadata = publicPageMetadata('/how-it-works');

const audiences = [
  { title: 'For customers', intro: 'See how to find food, build a bag, confirm a cash-on-delivery order, manage recurring baskets and get after-sales help.', href: '/how-it-works/customers', label: 'Read the customer guide', icon: ShoppingBag, stages: ['Browse products', 'Build a bag', 'Order with COD', 'Delivery & care'] },
  { title: 'For suppliers', intro: 'Follow the application, approval, catalogue upload and fulfilment process for growers, food makers and distributors.', href: '/how-it-works/suppliers', label: 'Read the supplier guide', icon: Sprout, stages: ['Supplier application', 'FreshPick review', 'Catalogue import', 'Ongoing supply'] },
];

export default function HowItWorksPage() {
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-secondary/40"><div className="editorial-wrap py-14 md:py-24">
      <p className="editorial-label">Understanding FreshPick</p>
      <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-tight tracking-tight md:text-7xl">Good food, with a clear process.</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">FreshPick brings households and local food producers together through a reviewed catalogue. Customers shop available products, suppliers apply to join, and FreshPick coordinates the operational side. Explore both journeys below.</p>
    </div></header>
    <section className="editorial-wrap py-12 md:py-20">
      <p className="editorial-label">Two sides. One market.</p>
      <h2 className="mt-3 font-serif text-3xl text-brand-green md:text-4xl">Choose your journey.</h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {audiences.map(({ title, intro, href, label, icon: Icon, stages }) => (
          <article key={href} className="flex flex-col border border-border p-7 md:p-10">
            <Icon className="h-9 w-9 text-brand-green" strokeWidth={1.5} aria-hidden="true"/>
            <h3 className="mt-6 font-serif text-3xl text-brand-green">{title}</h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{intro}</p>
            <ol className="mt-7 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">{stages.map((stage, index) => (
              <li key={stage} className="flex items-center gap-3 text-sm"><span className="text-brand-clay">{String(index + 1).padStart(2, '0')}</span>{stage}</li>
            ))}</ol>
            <Link href={href} className="editorial-link mt-9">{label} <ArrowRight className="h-4 w-4" aria-hidden="true"/></Link>
          </article>
        ))}
      </div>
    </section>
    <section className="border-y border-border bg-secondary/35"><div className="editorial-wrap py-12 md:py-20">
      <p className="editorial-label">The business model</p>
      <h2 className="mt-3 max-w-3xl font-serif text-3xl text-brand-green md:text-4xl">How the three sides work together.</h2>
      <div className="mt-9 grid gap-8 md:grid-cols-3">
        <article className="border-t border-border pt-5"><Sprout className="h-6 w-6 text-brand-green" aria-hidden="true"/><h3 className="mt-4 text-xl font-semibold text-brand-green">01. Producers apply</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">Growers and makers send business and product information. FreshPick reviews suppliers and catalogue uploads before public listing.</p></article>
        <article className="border-t border-border pt-5"><ShoppingBag className="h-6 w-6 text-brand-green" aria-hidden="true"/><h3 className="mt-4 text-xl font-semibold text-brand-green">02. Households order</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">Customers choose currently available products, confirm the delivery area and place cash-on-delivery orders through FreshPick.</p></article>
        <article className="border-t border-border pt-5"><PackageCheck className="h-6 w-6 text-brand-green" aria-hidden="true"/><h3 className="mt-4 text-xl font-semibold text-brand-green">03. FreshPick coordinates</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">The operations team manages catalogue publication, order records, delivery coordination, enquiries and supplier agreements.</p></article>
      </div>
      <p className="mt-9 border-l-4 border-brand-green bg-background p-5 text-sm leading-7 text-muted-foreground">The current platform is a curated market rather than automatic supplier self-publication. It does not yet charge customers by card or automatically split and settle supplier payments. Prices, delivery commitments and commercial supplier terms must be confirmed.</p>
    </div></section>
    <section className="editorial-wrap py-12 md:py-16"><h2 className="font-serif text-3xl text-brand-green">Questions?</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Find delivery and ordering answers, or contact the team directly.</p><div className="mt-6 flex flex-wrap gap-6"><Link href="/help" className="editorial-link">Ordering help</Link><Link href="/refund" className="editorial-link">Returns and refunds</Link><Link href="/contact" className="editorial-link">Contact FreshPick</Link></div></section>
  </main>;
}
