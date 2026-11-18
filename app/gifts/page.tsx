import Link from 'next/link';
import ExperienceCards from '@/components/experiences/ExperienceCards';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata = publicPageMetadata('/gifts');

export default function Gifts() {
  return <section className="editorial-wrap py-12 md:py-20">
    <h1 className="max-w-3xl font-serif text-5xl md:text-7xl">Give them something to look forward to.</h1>
    <p className="mb-8 mt-5 max-w-xl leading-7">Choose an experience and send a gift enquiry with your preferred date. For food delivered to family in Colombo, explore ordering for someone else.</p>
    <ExperienceCards />
    <Link href="/diaspora" className="editorial-button mt-10">Order food for someone else</Link>
  </section>;
}
