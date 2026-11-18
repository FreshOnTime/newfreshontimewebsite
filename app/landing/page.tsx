import { publicPageMetadata } from '@/lib/publicPages';
export const metadata = publicPageMetadata('/landing');
import Link from 'next/link';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';

export default function LandingPage() {
  return <div>
    <PremiumPageHeader eyebrow="Welcome to FreshPick" title="Gather around the table." subtitle="Discover occasions, explore the food market or apply to partner with FreshPick." backgroundImage="/images/experiences/table.webp" />
    <div className="editorial-wrap pt-8"><Link href="/experiences" className="editorial-button">Explore experiences</Link></div>
    <section className="editorial-wrap editorial-section grid gap-10 md:grid-cols-2 md:gap-20">
      <article className="border-t border-border pt-6"><h2 className="font-serif text-3xl text-brand-green">For your kitchen</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">Create an account to save groceries, manage your orders and build your regular shopping bag.</p><Link href="/auth/signup/customer" className="editorial-button mt-7">Create a customer account</Link></article>
      <article className="border-t border-border pt-6"><h2 className="font-serif text-3xl text-brand-green">For growers & makers</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">Tell us about your business and the products you would like to share through FreshPick.</p><Link href="/auth/supplier-signup" className="editorial-link mt-7">Apply as a supplier</Link></article>
    </section>
  </div>;
}
