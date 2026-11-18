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
    <h1 className="section-masthead">Experiences</h1>

    <nav aria-label="Filter experiences by occasion" className="occasion-tabs">
      {['All occasions', ...occasions].map((name, index) => {
        const active = selected ? name === selected : index === 0;
        return <Link key={name} aria-current={active ? 'page' : undefined} href={index ? { pathname: '/experiences', query: { occasion: name } } : '/experiences'} className="occasion-tab">{name}</Link>;
      })}
    </nav>
    <h2 className="mb-4 text-3xl">Book with a host</h2>
    {sessions.length ? <SessionList sessions={sessions} /> : <p>No sessions available for this selection.</p>}
    <Pagination path={selected ? '/experiences?occasion=' + encodeURIComponent(selected) : '/experiences'} page={page} more={sessions.length === 24} />
    <h2 className="mb-4 mt-10 text-3xl">Occasion ideas</h2>
    <ExperienceCards items={items} />
  </section>;
}
