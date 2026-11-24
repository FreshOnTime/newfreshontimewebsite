import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { MakerItemCard } from '@/components/makers/MakerCards';
import { publicItemSelect } from '@/lib/makerQueries';
import { publicMakerWhere } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({ path: '/', title: 'FreshPick | Discover Sri Lankan food makers', description: 'Meet independent bakers, home cooks and growers. Explore their items, stories and latest batches.' });

const categories = [
  ['Bakery', 'bakery'], ['Prepared food', 'cooked-food'], ['Pantry', 'pantry-staples'], ['Produce', 'greens-herbs'],
];

export default async function Home() {
  const items = await prisma.makerItem.findMany({ where: { published: true, supplier: publicMakerWhere }, take: 4,
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: { ...publicItemSelect, supplier: { select: { makerHandle: true } } } });
  return <>
    <section className="maker-hero">
      <div className="maker-hero-copy">
        <h1 className="maker-headline">Meet the people behind your <em className="text-[#923d29]">next meal.</em></h1>
        <p className="mt-6 max-w-md leading-7">Find independent bakers, home cooks and growers across Sri Lanka. See what’s fresh and message the maker directly.</p>
        <form action="/makers" className="mt-7 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-black/15 bg-white p-2">
          <MapPin size={18} className="ml-2 shrink-0"/><input name="town" aria-label="Search by town" placeholder="Your town or area" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm" /><button className="maker-button">Explore</button>
        </form>
      </div>
      <div className="maker-hero-photo"><Image src="/images/editorial/hands-at-work.webp" fill priority sizes="(max-width:767px) 100vw, 53vw" alt="Hands shaping dough on a flour-dusted work surface" className="object-cover" /></div>
    </section>
    <section className="editorial-wrap py-12 md:py-16">
      <h2 className="editorial-title">Explore by craft</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{categories.map(([name, image]) => <Link key={name} href={`/makers?kind=${encodeURIComponent(name)}`} className="group">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg"><Image src={`/images/categories/${image}.webp`} alt="" fill sizes="(max-width:1023px) 45vw, 24vw" className="object-cover transition-transform group-hover:scale-105"/></div>
        <span className="mt-3 flex items-center justify-between font-serif text-xl">{name}<ArrowUpRight size={17}/></span>
      </Link>)}</div>
    </section>
    {items.length > 0 && <section className="editorial-wrap pb-14"><h2 className="editorial-title">Fresh from the makers</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(item => <MakerItemCard key={item.id} handle={item.supplier.makerHandle} item={item}/>)}</div></section>}
    <section className="editorial-wrap pb-14"><div className="grid gap-6 border-y border-border py-10 md:grid-cols-2">
      <div><h2 className="font-serif text-4xl">From their kitchens</h2><Link href="/stories" className="editorial-link">Read the food stories <ArrowUpRight size={16}/></Link></div>
      <div><h2 className="font-serif text-4xl">Make something yourself?</h2><Link href="/join" className="editorial-link">Open your maker page <ArrowUpRight size={16}/></Link></div>
    </div></section>
  </>;
}
