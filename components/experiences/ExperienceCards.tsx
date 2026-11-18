import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { experiences } from '@/lib/experiences';

export default function ExperienceCards({ items = experiences }: { items?: typeof experiences }) {
  return <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(item => <Link key={item.slug} href={`/experiences/${item.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
        <Image fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" src={item.image} alt={item.alt} className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-brand-green">{item.kind}</p>
      <h3 className="mt-2 flex items-center justify-between gap-2 font-serif text-3xl">{item.title}<ArrowUpRight aria-hidden="true" size={20} /></h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
    </Link>)}
  </div>;
}
