import Link from 'next/link';
import { EditorialHeader, GuideShelf } from '@/components/discovery/Editorial';
import prisma from '@/lib/prisma';
import { publicMakerWhere } from '@/lib/makers';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'The food journal' };
export default async function Stories({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Math.min(10000, Number.parseInt((await searchParams).page || '1') || 1));
  const rows = await prisma.blog.findMany({
    where: { published: true, isDeleted: false, supplier: publicMakerWhere },
    skip: (page - 1) * 20, take: 21, orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    select: { id: true, title: true, excerpt: true, slug: true, supplier: { select: { name: true, makerHandle: true } } },
  });
  return <>
    <div className="fp26-shell"><EditorialHeader eyebrow="FreshPick editorial" title="The food journal." description="Practical buying guides and stories about the food we eat."/><GuideShelf slugs={["a-table-for-two","the-price-on-the-jar","a-gift-worth-opening"]} heading="The good food guide"/></div>
    {rows.length > 0 && <section className="fp-section editorial-wrap"><div className="fp-section-head"><h2>From the makers</h2></div>
      <div className="fp-story-list">{rows.slice(0,20).map(row => <Link key={row.id} href={`/makers/${row.supplier?.makerHandle}/stories/${row.slug}`}>
        <span className="fp-kicker">{row.supplier?.name}</span><h3>{row.title}</h3><p>{row.excerpt}</p></Link>)}</div></section>}
    {(page > 1 || rows.length > 20) && <nav className="editorial-wrap flex gap-5 py-5 underline" aria-label="Story pages">
      {page > 1 && <Link href={`/stories?page=${page - 1}`}>Previous</Link>}
      {rows.length > 20 && <Link href={`/stories?page=${page + 1}`}>Next</Link>}
    </nav>}
    <div className="fp26-shell"><GuideShelf slugs={["the-bread-window","a-place-for-pepper","a-basket-of-greens"]} heading="Notes from the kitchen"/></div><div className="editorial-wrap pb-10"><Link className="fp-inline" href="/blog">Browse the editorial archive</Link></div>
  </>;
}
