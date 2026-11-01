import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CUSTOMER_QUESTIONS } from '@/lib/customerHelp';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/config/site';

export default function HomeHelp() {
  const questions = [CUSTOMER_QUESTIONS[0], CUSTOMER_QUESTIONS[2], CUSTOMER_QUESTIONS[3]];
  return <><JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", "@id": absoluteUrl("/#questions"), mainEntity: questions.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} /><section className="editorial-wrap editorial-section" aria-labelledby="home-help-title">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><h2 id="home-help-title" className="editorial-title">A little help.</h2><Link href="/help" className="editorial-link">Delivery & ordering <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    <div className="grid gap-x-10 md:grid-cols-3">{questions.map(item => <article key={item.question} className="border-t border-border py-6"><h3 className="text-lg font-semibold text-brand-green">{item.question}</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p><Link href={item.href} className="editorial-link mt-4">{item.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>)}</div>
  </section></>;
}
