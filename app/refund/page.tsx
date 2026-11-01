
import Link from 'next/link';
import { Clock, CheckCircle2 } from 'lucide-react';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import { SUPPORT_EMAIL } from '@/lib/config/site';

export default function RefundPage() {
  return <main className="min-h-screen bg-background">
    <PremiumPageHeader title="Refund & replacement policy" subtitle="What to do when an order needs attention." backgroundImage="/images/home/tomatoes.webp"/>
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 flex gap-4 rounded-lg border border-border bg-secondary p-6">
        <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-brand-green" aria-hidden="true"/>
        <div><h2 className="font-semibold text-brand-green">Freshness and product quality</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">If something is wrong with your order, report it promptly with your order number and details. FreshPick reviews eligible replacement or refund requests within the reporting windows below.</p></div>
      </section>
      <div className="grid gap-8 border-b border-border pb-9 md:grid-cols-2">
        <section><h2 className="flex items-center gap-2 text-xl font-semibold text-brand-green"><Clock className="h-5 w-5" aria-hidden="true"/> Perishable items</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Report quality issues with vegetables, fruit or other perishable foods within <strong>24 hours of delivery</strong>. Include a photo where possible. The team reviews the concern and advises on replacement or refund options.</p></section>
        <section><h2 className="flex items-center gap-2 text-xl font-semibold text-brand-green"><Clock className="h-5 w-5" aria-hidden="true"/> Non-perishable items</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Request a return of eligible packaged goods within <strong>7 days of delivery</strong>. They should be unopened and in original packaging except where a defect or an applicable legal right requires otherwise.</p></section>
      </div>
      <section className="py-9"><h2 className="font-serif text-3xl text-brand-green">How to request help</h2>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
          <li>Open <Link href="/orders" className="text-brand-green underline underline-offset-4">your orders</Link> and note the order number.</li>
          <li>Take clear photos when reporting missing, damaged or incorrect items.</li>
          <li>Use <Link href="/contact?type=issue&source=support" className="text-brand-green underline underline-offset-4">the support form</Link> or email <a href={'mailto:' + SUPPORT_EMAIL} className="break-all text-brand-green underline underline-offset-4">{SUPPORT_EMAIL}</a>.</li>
          <li>The FreshPick team reviews your request and confirms the appropriate next steps.</li>
        </ol>
      </section>
      <section className="space-y-6 border-t border-border py-9"><h2 className="font-serif text-3xl text-brand-green">Refunds and unavailable products</h2>
        <p className="text-sm leading-7 text-muted-foreground">Website checkout currently supports <strong>cash on delivery</strong>, not online card payment. There is no automated credit-card refund process. If you have paid for an item requiring a refund, support will confirm the appropriate arrangement.</p>
        <p className="text-sm leading-7 text-muted-foreground">If an item becomes unavailable during packing, confirm a change, cancellation or payment adjustment with the team. No automatic bank transfer, credit or fixed resolution time is promised here. Applicable statutory consumer rights remain unaffected.</p>
        <div className="flex flex-wrap gap-6"><Link href="/how-it-works/customers" className="editorial-link">Customer ordering guide</Link><Link href="/help" className="editorial-link">Delivery and ordering answers</Link></div>
      </section>
    </div>
  </main>;
}
