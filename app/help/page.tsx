import Link from 'next/link';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { CUSTOMER_QUESTIONS } from '@/lib/customerHelp';
import { publicPageMetadata } from '@/lib/publicPages';
import { absoluteUrl, SUPPORT_EMAIL } from '@/lib/config/site';

export const metadata = publicPageMetadata('/help');

export default function HelpPage() {
  return <div className="bg-background">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', '@id': absoluteUrl('/help#questions'), mainEntity: CUSTOMER_QUESTIONS.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) }} />
    <PremiumPageHeader eyebrow="Customer care" title="Delivery & ordering." subtitle="Practical answers for shopping with FreshPick in Colombo." />
    <div className="editorial-wrap editorial-section grid gap-10 lg:grid-cols-[1fr_2fr]">
      <aside><h2 className="text-xl font-semibold text-brand-green">Need a hand?</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">For an existing order, include your order number when contacting us.</p><Link href="/contact" className="editorial-link mt-4">Contact FreshPick</Link><a href={`mailto:${SUPPORT_EMAIL}`} className="mt-5 block break-words text-sm text-brand-green underline">{SUPPORT_EMAIL}</a><nav aria-label="Support links" className="mt-6 flex flex-wrap gap-5"><Link href="/orders" className="editorial-link">Your orders</Link><Link href="/help-us" className="editorial-link">Share feedback</Link></nav></aside>
      <section aria-label="Ordering questions">{CUSTOMER_QUESTIONS.map(item => <article key={item.question} className="border-t border-border py-6"><h2 className="text-xl font-semibold text-brand-green">{item.question}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p><Link href={item.href} className="editorial-link mt-4">{item.action}</Link></article>)}</section>
    </div>
  </div>;
}
