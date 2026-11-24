import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BatchDetails, MakerPhoto } from '@/components/makers/MakerCards';
import { publicItemSelect } from '@/lib/makerQueries';
import { makerItemPath, openBatches, publicMakerWhere } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { publicPageMetadata } from '@/lib/publicPages';

export const dynamic = 'force-dynamic';
export const metadata = publicPageMetadata('/makers');

export default async function MakersPage({ searchParams }: { searchParams: Promise<{ town?: string | string[]; page?: string | string[] }> }) {
  const filters = await searchParams;
  const town = typeof filters.town === 'string' ? filters.town.trim().slice(0, 100) : '';
  const page = typeof filters.page === 'string' && /^\d{1,4}$/.test(filters.page) ? Math.max(1, Number(filters.page)) : 1;
  const pageSize = 12;
  const where = { ...publicMakerWhere, ...(town ? { makerTown: { contains: town, mode: 'insensitive' as const } } : {}) };
  const [batches, makers, stories] = await Promise.all([
    prisma.makerBatch.findMany({
      where: { ...openBatches(), item: { published: true, supplier: where } },
      orderBy: [{ cutoff: 'asc' }, { id: 'asc' }],
      take: pageSize + 1,
      skip: (page - 1) * pageSize,
      include: { item: { select: { ...publicItemSelect, supplier: { select: { name: true, makerHandle: true, makerTown: true, makerWhatsApp: true } } } } },
    }),
    prisma.supplier.findMany({
      where, orderBy: [{ name: 'asc' }, { id: 'asc' }], take: pageSize + 1, skip: (page - 1) * pageSize,
      select: { id: true, name: true, makerHandle: true, makerTown: true, makerBio: true },
    }),
    prisma.blog.findMany({
      where: { published: true, isDeleted: false, supplier: where },
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }], take: pageSize + 1, skip: (page - 1) * pageSize,
      select: { id: true, title: true, slug: true, excerpt: true, supplier: { select: { name: true, makerHandle: true } } },
    }),
  ]);
  const pageLink = (next: number) => `/makers?${new URLSearchParams({ ...(town ? { town } : {}), page: String(next) })}`;

  return <main className="bg-background pb-16">
    <header className="border-b border-border bg-brand-cream">
      <div className="editorial-wrap py-12 md:py-20">
        <h1 className="max-w-3xl font-serif text-5xl leading-tight text-brand-green md:text-7xl">Fresh near you.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Find what local bakers, cooks, growers and food makers are preparing, and enquire with them directly.</p>
        <form action="/makers" className="mt-6 flex max-w-xl flex-wrap items-end gap-3">
          <label htmlFor="maker-town" className="flex-1 space-y-2 text-sm font-semibold">
            <span>Town</span>
            <input id="maker-town" name="town" defaultValue={town} maxLength={100} placeholder="e.g. Nawala" className="block min-h-11 w-full rounded-lg border border-border bg-background px-3 font-normal" />
          </label>
          <button className="min-h-11 rounded-lg bg-brand-green px-5 font-semibold text-white">Find makers</button>
        </form>
        {town && <Link href="/makers" className="mt-3 inline-block text-sm underline">Show all towns</Link>}
      </div>
    </header>
    <div className="editorial-wrap space-y-12 py-10">
      <section>
        <h2 className="editorial-title">Open for preorders</h2>
        {batches.length === 0 && <p className="mt-3 text-muted-foreground">No open batches{town ? ` near ${town}` : ''} on this page. Browse makers for made-to-order items.</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.slice(0, pageSize).map(batch => {
            const { item } = batch;
            const shop = item.supplier;
            return <article key={batch.id} className="rounded-2xl border border-border p-3">
              <Link href={makerItemPath(shop.makerHandle, item.slug)}>
                <MakerPhoto image={item.image} name={item.name} />
                <h3 className="px-3 pt-3 font-serif text-2xl text-brand-green">{item.name}</h3>
              </Link>
              <div className="space-y-3 p-3">
                <Link href={`/makers/${shop.makerHandle}`} className="text-sm text-muted-foreground hover:underline">{shop.name} · {shop.makerTown}</Link>
                <BatchDetails batch={batch} itemName={item.name} phone={shop.makerWhatsApp} />
              </div>
            </article>;
          })}
        </div>
      </section>
      <section>
        <h2 className="editorial-title">Meet the makers</h2>
        {makers.length === 0 && <p className="mt-3 text-muted-foreground">No makers found on this page.</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {makers.slice(0, pageSize).map(maker => <Link key={maker.id} href={`/makers/${maker.makerHandle}`} className="rounded-xl border border-border p-5 hover:bg-brand-cream">
            <h3 className="flex items-center justify-between gap-3 font-serif text-xl text-brand-green">{maker.name}<ArrowUpRight className="shrink-0" size={16} aria-hidden="true" /></h3>
            <p className="mt-1 text-sm text-muted-foreground">{maker.makerTown}</p>
            {maker.makerBio && <p className="mt-2 line-clamp-2 break-words text-sm">{maker.makerBio}</p>}
          </Link>)}
        </div>
        <Link href="/auth/signup/supplier" className="mt-5 inline-block text-sm font-semibold text-brand-green underline">Join FreshPick as a maker</Link>
      </section>
      {stories.length > 0 && <section>
        <h2 className="editorial-title">Stories from makers</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, pageSize).map(story => <Link key={story.id} href={`/makers/${story.supplier?.makerHandle}/stories/${story.slug}`} className="rounded-xl border border-border p-5 hover:bg-brand-cream">
            <p className="text-sm text-muted-foreground">{story.supplier?.name}</p>
            <h3 className="mt-1 font-serif text-xl text-brand-green">{story.title}</h3>
            <p className="mt-2 line-clamp-2 break-words text-sm">{story.excerpt}</p>
          </Link>)}
        </div>
      </section>}
      <nav aria-label="Maker discovery pages" className="flex gap-5 text-sm font-semibold text-brand-green">
        {page > 1 && <Link href={pageLink(page - 1)}>Previous page</Link>}
        {[batches, makers, stories].some(results => results.length > pageSize) && <Link href={pageLink(page + 1)}>Next page</Link>}
      </nav>
    </div>
  </main>;
}
