import { publicPageMetadata } from '@/lib/publicPages';
export const dynamic = 'force-dynamic';
export const metadata = publicPageMetadata('/landing');
import Link from 'next/link';
import Home from '@/app/page';

export default function LandingPage() {
  return <div>
    <Home />
    <section className="editorial-wrap editorial-section grid gap-10 md:grid-cols-2 md:gap-20">
      <article className="border-t border-border pt-6"><h2 className="font-serif text-3xl text-brand-green">For your kitchen</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">Create an account to save groceries, manage your orders and build your regular shopping bag.</p><Link href="/auth/signup/customer" className="editorial-button mt-7">Create a customer account</Link></article>
      <article className="border-t border-border pt-6"><h2 className="font-serif text-3xl text-brand-green">For growers & makers</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">Tell us about your business and the products you would like to share through FreshPick.</p><Link href="/auth/supplier-signup" className="editorial-link mt-7">Apply as a supplier</Link></article>
    </section>
  </div>;
}
