import Link from 'next/link';
import { listSessions } from '@/lib/marketplace';
import { SessionList } from '@/components/marketplace/Listings';
import ExperienceCards from '@/components/experiences/ExperienceCards';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata = publicPageMetadata('/gifts');

export const dynamic = 'force-dynamic';
export default async function Gifts() {
  const sessions = await listSessions();
  return <section className="editorial-wrap py-12 md:py-20">
    <h1 className="section-masthead">Food &amp; experience gifts</h1>
    <p className="mb-8 mt-5 max-w-xl leading-7">Reserve a session in your guest’s name, or enquire about a date for a special occasion.</p>
    {sessions.length > 0 && <section className="mb-10"><h2 className="mb-4 text-3xl">Reserve for a guest</h2><SessionList sessions={sessions.slice(0, 6)} /><Link href="/experiences" className="editorial-link">See all sessions</Link></section>}
    <ExperienceCards />
    <Link href="/diaspora" className="editorial-button mt-10">Order food for someone else</Link>
  </section>;
}
