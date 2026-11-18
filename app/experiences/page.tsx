import Link from 'next/link';
import ExperienceCards from '@/components/experiences/ExperienceCards';
import { experiences, occasions } from '@/lib/experiences';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata = publicPageMetadata('/experiences');

export default async function Experiences({ searchParams }: { searchParams: Promise<{ occasion?: string }> }) {
  const { occasion } = await searchParams;
  const selected = occasions.find(name => name === occasion);
  const items = selected ? experiences.filter(item => item.occasions.includes(selected)) : experiences;
  return <section className="editorial-wrap py-12 md:py-20">
    <h1 className="font-serif text-5xl md:text-7xl">Explore experiences</h1>
    <p className="mt-4 max-w-xl leading-7">Discover ideas for your occasion. Enquire for partner availability and a price for your date.</p>
    <nav aria-label="Filter experiences by occasion" className="my-8 flex flex-wrap gap-2">
      {['All occasions', ...occasions].map((name, index) => {
        const active = selected ? name === selected : index === 0;
        return <Link key={name} aria-current={active ? 'page' : undefined} href={index ? { pathname: '/experiences', query: { occasion: name } } : '/experiences'} className={`rounded-full border px-5 py-3 text-sm ${active ? 'bg-[#42272c] text-white' : 'border-border'}`}>{name}</Link>;
      })}
    </nav>
    <ExperienceCards items={items} />
  </section>;
}
