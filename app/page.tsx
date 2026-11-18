import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ExperienceCards from '@/components/experiences/ExperienceCards';
import { occasions } from '@/lib/experiences';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata = publicPageMetadata('/');

export default function Home() {
  return <div className="bg-[#faf7ef] text-[#33231f]">
    <section className="grid bg-[#42272c] text-[#fff6e9] md:grid-cols-[0.88fr_1.12fr]">
      <div className="flex flex-col items-start justify-center px-6 py-12 sm:px-12 lg:px-[max(4rem,calc((100vw-80rem)/2))] lg:pr-10 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[.18em]">Colombo, Sri Lanka</p>
        <h1 className="my-5 font-serif text-[clamp(3.4rem,6.6vw,7rem)] leading-[.99] tracking-[-.055em]">Come to<br /><i>the table.</i></h1>
        <p className="max-w-sm text-base leading-7">Find a dinner for two, a gift to share or something to make together in Colombo.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center gap-4 rounded-full bg-[#fff6e9] px-6 font-semibold text-[#42272c]" href="/experiences">Explore experiences <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <div className="relative min-h-64 md:min-h-[29rem]">
        <Image src="/images/experiences/table.webp" alt="Flowers and glassware arranged for a shared dinner" fill priority sizes="(max-width: 767px) 100vw, 56vw" className="object-cover" />
      </div>
    </section>
    <section className="editorial-wrap py-12 md:py-20">
      <h2 className="font-serif text-4xl md:text-6xl">What’s the occasion?</h2>
      <nav aria-label="Browse by occasion" className="mb-8 mt-5 flex flex-wrap gap-2">
        {occasions.map(name => <Link key={name} className="rounded-full border border-[#bca99c] px-5 py-3 text-sm hover:bg-white" href={{ pathname: '/experiences', query: { occasion: name } }}>{name}</Link>)}
      </nav>
      <ExperienceCards />
    </section>
    <section aria-label="More ways to explore FreshPick" className="editorial-wrap grid gap-4 pb-12 sm:grid-cols-3">
      {[
        ['Send a gift', 'Food and experiences for someone special.', '/gifts'],
        ['Order food', 'Find prepared meals for your table.', '/meals'],
        ['Shop groceries', 'Browse the everyday market.', '/products'],
      ].map(([title, copy, href]) => <Link href={href} key={href} className="rounded-lg border border-[#d5c8b8] p-6 hover:bg-white">
        <h2 className="flex items-center justify-between font-serif text-2xl">{title}<ArrowRight size={18} aria-hidden="true" /></h2><p className="mt-2 text-sm">{copy}</p>
      </Link>)}
    </section>
  </div>;
}
