import Link from 'next/link';
import { listSessions } from '@/lib/marketplace';
import { Pagination, SessionList, pageNumber } from '@/components/marketplace/Listings';
import ExperienceCards from '@/components/experiences/ExperienceCards';
import { experiences, occasions } from '@/lib/experiences';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata = publicPageMetadata('/experiences');

export default async function Experiences({ searchParams }: { searchParams: Promise<{ occasion?: string; page?: string }> }) {
  const { occasion, page: raw } = await searchParams;
  const selected = occasions.find(name => name === occasion);
  const page = pageNumber(raw);
  const sessions = await listSessions({ occasion: selected, page });
  const items = selected ? experiences.filter(item => item.occasions.includes(selected)) : experiences;
  return <section className="editorial-wrap py-12 md:py-20">
    <h1 className="font-serif text-5xl md:text-7xl">Explore experiences</h1>
    <p className="mt-4 max-w-xl leading-7">Choose a published session to reserve places with the host, or explore ideas for a future occasion.</p>
    <nav aria-label="Filter experiences by occasion" className="my-8 flex flex-wrap gap-2">
      {['All occasions', ...occasions].map((name, index) => {
        const active = selected ? name === selected : index === 0;
        return <Link key={name} aria-current={active ? 'page' : undefined} href={index ? { pathname: '/experiences', query: { occasion: name } } : '/experiences'} className={`rounded-full border px-5 py-3 text-sm ${active ? 'bg-brand-green-deep text-white' : 'border-border'}`}>{name}</Link>;
      })}
    </nav>
    <h2 className="mb-4 text-3xl">Book with a host</h2>
    {sessions.length ? <SessionList sessions={sessions} /> : <p>No sessions available for this selection.</p>}
    <Pagination path={selected ? '/experiences?occasion=' + encodeURIComponent(selected) : '/experiences'} page={page} more={sessions.length === 24} />
    <h2 className="mb-4 mt-10 text-3xl">Occasion ideas</h2>
    <ExperienceCards items={items} />
  </section>;
}
