import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import PartnershipRequestForm from './PartnershipRequestForm';

const paths = [
  { id: 'for-buyers', label: 'For kitchens & workplaces', title: 'Source for your business.', copy: 'Buying for a restaurant, café, hotel or workplace? Tell us what you need, how often and in what quantities. We’ll discuss availability, delivery and a suitable arrangement.', image: '/images/editorial/restaurant-kitchen.webp', alt: 'Food preparation in a professional kitchen', action: 'Discuss your supply needs', href: '#business-enquiry' },
  { id: 'for-suppliers', label: 'For growers, makers & brands', title: 'Supply the market.', copy: 'Home-grown vegetables, homemade food, bakery, beverages or pantry products: share what you make or grow. Supplier applications are reviewed for quality, consistency and fit.', image: '/images/editorial/hands-at-work.webp', alt: 'Dough being prepared by hand', action: 'Apply as a supplier', href: '/auth/signup/supplier' },
];

export default function B2BContent() {
  return <div className="bg-background">
    <PremiumPageHeader eyebrow="FreshPick for business" title="Good food. A bigger table." subtitle="One place for businesses buying food and producers bringing their products to the FreshPick market." backgroundImage="/images/editorial/restaurant-kitchen.webp" />
    <div className="editorial-wrap editorial-section">
      <section aria-labelledby="business-paths-title">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5"><h2 id="business-paths-title" className="editorial-title">For business.</h2><Link href="#business-enquiry" className="editorial-link">Start a conversation<ArrowDown className="h-4 w-4" aria-hidden="true" /></Link></div>
        <div className="grid gap-12 md:grid-cols-2 md:gap-10">{paths.map(path => <article id={path.id} key={path.id} className="scroll-mt-28">
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-secondary"><Image src={path.image} alt={path.alt} fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></div>
          <p className="editorial-label mt-6">{path.label}</p><h3 className="mt-3 text-3xl font-normal tracking-tight text-brand-green">{path.title}</h3><p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">{path.copy}</p><Link href={path.href} className="editorial-link mt-5">{path.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>)}</div>
      </section>
      <section id="business-enquiry" className="mt-16 grid scroll-mt-28 gap-9 border-t border-border pt-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16 md:mt-24 md:pt-16">
        <div><p className="editorial-label">Business & supplier enquiries</p><h2 className="editorial-title mt-5">Tell us a little about yourself.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Our team will review your enquiry and discuss the next steps. For a supplier account, use the application above; for an initial conversation, use this form.</p></div><PartnershipRequestForm />
      </section>
    </div>
  </div>;
}
