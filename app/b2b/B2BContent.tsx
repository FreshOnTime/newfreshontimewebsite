import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import PartnershipRequestForm from './PartnershipRequestForm';
import AnswerSection from '@/components/seo/AnswerSection';
import { BUSINESS_FAQS, PRODUCER_FAQS } from '@/lib/answerContent';
import SupplierPartnerships from './SupplierPartnerships';

const paths = [
  { id: 'for-buyers', label: 'For kitchens & workplaces', title: 'Source for your business.', copy: 'Buying for a restaurant, café, hotel or workplace? Tell us what you need, how often and in what quantities. We’ll discuss availability, delivery and a suitable arrangement.', image: '/images/editorial/restaurant-kitchen.webp', alt: 'Food preparation in a professional kitchen', action: 'Discuss your supply needs', href: '#business-enquiry' },
  { id: 'for-suppliers', label: 'For growers, makers & brands', title: 'Supply the market.', copy: 'Home-grown vegetables, homemade food, bakery, beverages or pantry products: share what you make or grow. Supplier applications are reviewed for quality, consistency and fit.', image: '/images/editorial/hands-at-work.webp', alt: 'Dough being prepared by hand', action: 'Apply as a supplier', href: '#business-enquiry' },
];

export default function B2BContent() {
  return <div className="bg-background">
    <PremiumPageHeader eyebrow="FreshPick for business" title="Good food. A bigger table." subtitle="One place for businesses buying food and producers bringing their products to the FreshPick market." backgroundImage="/images/editorial/restaurant-kitchen.webp" />
    <div className="editorial-wrap editorial-section">
      <section aria-labelledby="business-paths-title">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5"><h2 id="business-paths-title" className="editorial-title">For business.</h2><Link href="#business-enquiry" className="editorial-link">Start a conversation<ArrowDown className="h-4 w-4" aria-hidden="true" /></Link></div>
        <div className="grid gap-12 md:grid-cols-2 md:gap-10">{paths.map(path => <article id={path.id} key={path.id} className="scroll-mt-28">
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-secondary"><Image src={path.image} alt={path.alt} fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></div>
          <p className="editorial-label mt-6">{path.label}</p><h3 className="mt-3 text-3xl font-normal tracking-tight text-brand-green">{path.title}</h3><p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">{path.copy}</p><div className="mt-5 flex flex-wrap items-center gap-6"><Link href={path.href} className="editorial-link">{path.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>{path.id === 'for-suppliers' && <Link href="#supplier-partnerships" className="editorial-link">Learn about supplier partnerships<ArrowDown className="h-4 w-4" aria-hidden="true" /></Link>}</div>
        </article>)}</div>
      </section>
      <section id="business-enquiry" aria-labelledby="partnership-application-title" tabIndex={-1} className="mt-16 grid scroll-mt-28 gap-9 rounded-xl border border-brand-green/20 bg-secondary/35 p-5 outline-none transition-shadow target:ring-2 target:ring-brand-green/40 sm:p-8 lg:grid-cols-[1fr_1.5fr] lg:gap-12 lg:p-12 md:mt-24">
        <div><p className="editorial-label">Business & supplier enquiries</p><h2 id="partnership-application-title" className="editorial-title mt-5">Start your partnership.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Tell us what you supply or what your business needs. No account is required to start an enquiry. Our team will review your application and discuss the next steps.</p></div><PartnershipRequestForm />
      </section>
    </div>
    <SupplierPartnerships />
    <AnswerSection title="Partnerships, explained." eyebrow="Business and supplier questions" questions={[...BUSINESS_FAQS, ...PRODUCER_FAQS]} path="/b2b" />
  </div>;
}
