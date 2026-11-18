import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { experiences } from '@/lib/experiences';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

async function lookup(params: Props['params']) {
  const { slug } = await params;
  const item = experiences.find(entry => entry.slug === slug);
  if (!item) notFound();
  return item;
}

export const generateStaticParams = () => experiences.map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: Props) {
  const item = await lookup(params);
  return pageMetadata({ path: '/experiences/' + item.slug, title: item.title, description: item.summary });
}

export default async function Experience({ params }: Props) {
  const item = await lookup(params);
  return <article className="editorial-wrap py-8 md:py-16">
    <Link href="/experiences" className="editorial-link">← All experiences</Link>
    <div className="mt-7 grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg"><Image src={item.image} alt={item.alt} fill priority sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>
      <div><p className="text-sm font-semibold uppercase tracking-widest text-[#823e34]">{item.kind}</p>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">{item.title}</h1>
        <p className="mt-4 text-lg">{item.summary}</p><p className="mt-4 leading-7">{item.details}</p>
        <p className="mt-5 text-sm text-muted-foreground">FreshPick will need to confirm partner availability and pricing before you book.</p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Link className="editorial-button" href={{ pathname: '/contact', query: { experience: item.slug } }}>Ask about this experience</Link>
          <Link className="editorial-link" href={{ pathname: '/contact', query: { experience: item.slug, gift: '1' } }}>Enquire as a gift</Link>
        </div>
      </div>
    </div>
  </article>;
}
