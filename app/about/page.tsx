import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { publicPageMetadata } from '@/lib/publicPages';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import Wordmark from '@/components/brand/Wordmark';

export const metadata = publicPageMetadata('/about');
const householdNeeds = [
  { title: 'The everyday essentials', text: 'Vegetables for a curry, fruit for breakfast, rice and pantry staples to keep your kitchen ready. Start with the categories you actually use.', image: '/images/categories/pantry-staples.webp', alt: 'Rice, lentils and everyday pantry ingredients' },
  { title: 'Food for a busy day', text: 'Homemade food, bakery treats and prepared dishes belong alongside groceries. Check the current selection for something that makes mealtime easier.', image: '/images/categories/cooked-food.webp', alt: 'A prepared rice and curry meal with vegetables' },
  { title: 'A little something to share', text: 'A drink with lunch, fruit for a visitor or something from a local kitchen. Leave room in your bag for the small things that bring people together.', image: '/images/categories/beverages.webp', alt: 'Beverages served in glasses alongside fresh ingredients' },
];
const shoppingSteps = [
  { title: 'Start with a category', text: 'Go straight to the food you need, or browse the full market to compare what is available.' },
  { title: 'Build a bag for your home', text: 'Choose your quantities and save favourite products so your regular shopping is easier to find.' },
  { title: 'Choose how you order', text: 'Place a one-off grocery order, or explore an available recurring basket for a regular routine. Confirm your address and delivery details at checkout.' },
];

export default function AboutPage() {
  return <div className="bg-background text-foreground">
    <PremiumPageHeader eyebrow="About FreshPick" title="Good food. Everyday life." subtitle="A simpler way for Colombo households to shop for fresh groceries, pantry essentials and local food." backgroundImage="/images/about/everyday-kitchen.webp" />
    <section className="editorial-wrap editorial-section grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
      <div><Wordmark className="text-3xl md:text-4xl" /><h2 className="mt-5 text-2xl font-semibold leading-tight text-brand-green md:text-3xl">Built around what a home needs.</h2></div>
      <div className="space-y-5 text-base leading-8 text-muted-foreground"><p>Food shopping is part of running a home. It is the next meal, a stocked cupboard, lunch for the family and the ingredients you reach for again and again. FreshPick brings those needs into one market, so you can spend less time moving between shopping lists and more time deciding what you want to eat.</p><p>Our focus is everyday food in Colombo: fresh vegetables and fruit, useful pantry staples and food made by local businesses. Browse by category, check the current price and availability, and choose the quantities that suit your household.</p><p>We also want smaller food businesses to have a clear way to reach customers. Home growers, established produce suppliers, independent kitchens and beverage makers can apply to sell with FreshPick. Every application starts with the products, the people making them and the practical details of supplying them.</p></div>
    </section>
    <section aria-labelledby="household-title" className="editorial-wrap pb-12 md:pb-20">
      <p className="editorial-label mb-4">For your kitchen, your routine</p><h2 id="household-title" className="editorial-title">More than a grocery list.</h2>
      <div className="mt-8 grid gap-9 md:grid-cols-3">{householdNeeds.map(item => <article key={item.title}><div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover" /></div><h3 className="mt-5 text-xl font-semibold text-brand-green">{item.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p></article>)}</div>
    </section>
    <section aria-labelledby="shopping-title" className="border-y border-border bg-secondary/35">
      <div className="editorial-wrap editorial-section"><h2 id="shopping-title" className="editorial-title">Shopping, made straightforward.</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{shoppingSteps.map((step,index) => <article key={step.title} className="border-t border-border pt-5"><p className="text-sm font-medium text-brand-clay">0{index+1}</p><h3 className="mt-4 text-xl font-semibold text-brand-green">{step.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p></article>)}</div><Link href="/categories" className="editorial-button mt-8">Find your category <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    </section>
    <section className="editorial-wrap editorial-section grid items-center gap-9 md:grid-cols-2 md:gap-16">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"><Image src="/images/producers/home-garden.webp" alt="Leafy greens, aubergines and chillies growing in a small home garden" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>
      <div><p className="editorial-label mb-4">A place for local food businesses</p><h2 className="editorial-title">Small beginnings. Good food.</h2><p className="mt-5 text-base leading-7 text-muted-foreground">You do not have to start with a large farm or a long product list. Tell us what you grow or make, how much you can supply and where you are based. Our producer page explains the kinds of food businesses we welcome and how to apply.</p><Link href="/farm-to-table" className="editorial-link mt-5">Explore our producers <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><p className="mt-7 text-sm leading-7 text-muted-foreground">Have a question about an order? Check <Link href="/help" className="font-medium text-brand-green underline underline-offset-4">delivery and ordering help</Link> or <Link href="/contact" className="font-medium text-brand-green underline underline-offset-4">contact FreshPick</Link>.</p></div>
    </section>
  </div>;
}
