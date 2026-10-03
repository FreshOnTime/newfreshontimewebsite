import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { publicPageMetadata } from '@/lib/publicPages';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';

export const metadata = publicPageMetadata('/farm-to-table');
const producerTypes = [
  { title: 'Home growers', label: 'From a garden, not just a farm', copy: 'Grow leafy greens, herbs, chillies or seasonal vegetables at home? Tell us about your harvest, location and the quantities you can supply. Small batches are welcome for review.', image: '/images/producers/home-garden.webp', alt: 'Vegetables and herbs growing in a small tropical home garden' },
  { title: 'Vegetable & fruit suppliers', label: 'Everyday produce', copy: 'Farmers and produce businesses can offer vegetables, fruit and greens for everyday kitchens. Share your product list, seasonal availability, prices and how you handle the harvest.', image: '/images/editorial/market-crates.webp', alt: 'Fresh vegetables displayed in wooden market crates' },
  { title: 'Homemade food', label: 'Independent kitchens', copy: 'From cooked dishes and snacks to pickles and preserves, we welcome food-business applications with clear ingredients, portion sizes, preparation details and storage instructions.', image: '/images/categories/cooked-food.webp', alt: 'A cooked rice and curry meal with vegetable side dishes' },
  { title: 'Bakery & small-batch treats', label: 'Baked with care', copy: 'Bread, baked snacks and sweet treats can be part of the market too. Tell us about ingredients, allergens, pack sizes, preparation lead time and shelf life.', image: '/images/categories/bakery.webp', alt: 'Bread and baked goods on a kitchen table' },
  { title: 'Beverages', label: 'Something to sip', copy: 'Juices, tea, coffee and other packaged drinks are welcome for review. Include ingredients, bottle or pack size, expiry details and any refrigeration requirements.', image: '/images/categories/beverages.webp', alt: 'Drinks in glasses with fresh beverage ingredients' },
  { title: 'Pantry & packaged food', label: 'Cupboard essentials', copy: 'Rice, lentils, spices, sauces and other useful staples help complete a household shop. Send us pack sizes, labels, storage details and your regular supply capacity.', image: '/images/categories/pantry-staples.webp', alt: 'Rice, lentils and pantry staples in bowls' },
];
const steps = [
  { title: 'Tell us about your food', copy: 'Use the supplier application to share your contact details, business or producer name, address and a short list of products. An existing FreshPick account can apply too.' },
  { title: 'Work through the details', copy: 'FreshPick reviews the application. Be ready to discuss quantities, prices, ingredients and allergens where relevant, packaging, storage and supply arrangements.' },
  { title: 'Prepare your catalogue', copy: 'Once your supply arrangement is agreed, provide product photos and accurate product information. Your supplier workspace supports catalogue uploads and product management.' },
];

export default function FarmToTablePage() {
  return <div className="bg-background">
    <PremiumPageHeader eyebrow="Our producers" title="Grow it. Make it. Share it." subtitle="A place for home growers, produce suppliers and independent food businesses to bring their food to Colombo households." backgroundImage="/images/producers/home-garden.webp" imageLayout="compact" />
    <section className="editorial-wrap editorial-section grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
      <div><h2 className="editorial-title">Good food starts with people.</h2><Link href="/auth/signup/supplier" className="editorial-button mt-6">Apply to sell <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <div className="space-y-5 text-base leading-8 text-muted-foreground"><p>FreshPick brings different kinds of food businesses into one everyday market. That can mean vegetables from a grower, familiar produce from a supplier, a dish from an independent kitchen or a drink made in small batches.</p><p>We welcome applications from producers of different sizes. Start with what you can reliably grow, make or supply. You can describe a small seasonal harvest or a regular range of products without creating a full catalogue first.</p><p>Applications are reviewed before any public listing. Availability, food handling, product details and supply arrangements need to be agreed with FreshPick.</p></div>
    </section>
    <section aria-labelledby="producer-types-title" className="editorial-wrap pb-12 md:pb-20"><div className="mb-8"><p className="editorial-label mb-4">Who can sell with FreshPick?</p><h2 id="producer-types-title" className="editorial-title">Room for your kind of food.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">These are the kinds of producers and products we welcome for review. Browse the market for what is available today.</p></div>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{producerTypes.map(producer => <article key={producer.title}><div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"><Image src={producer.image} alt={producer.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" /></div><p className="editorial-label mt-5">{producer.label}</p><h3 className="mt-3 text-xl font-semibold text-brand-green">{producer.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{producer.copy}</p></article>)}</div>
      <Link href="/categories" className="editorial-link mt-8">Browse current categories <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </section>
    <section aria-labelledby="apply-title" className="border-y border-border bg-secondary/35"><div className="editorial-wrap editorial-section"><h2 id="apply-title" className="editorial-title">Start with a simple application.</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{steps.map((step,index) => <article key={step.title} className="border-t border-border pt-5"><p className="text-sm font-medium text-brand-clay">0{index+1}</p><h3 className="mt-4 text-xl font-semibold text-brand-green">{step.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{step.copy}</p></article>)}</div><div className="mt-8 flex flex-wrap gap-x-7 gap-y-3"><Link href="/auth/signup/supplier" className="editorial-button">Apply to sell with FreshPick <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/contact?type=question&source=producers" className="editorial-link">Ask a question <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div></section>
    <section className="editorial-wrap py-10"><p className="max-w-3xl text-sm leading-7 text-muted-foreground">Supply for a restaurant, café or workplace? <Link href="/b2b" className="font-medium text-brand-green underline underline-offset-4">Explore FreshPick for business</Link>. For household groceries, <Link href="/categories" className="font-medium text-brand-green underline underline-offset-4">start with a category</Link>.</p></section>
  </div>;
}
