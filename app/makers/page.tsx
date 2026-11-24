import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BatchDetails, MakerPhoto, MakerItemCard } from '@/components/makers/MakerCards';
import { publicItemSelect } from '@/lib/makerQueries';
import { makerKinds, makerItemPath, openBatches, publicMakerWhere } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { publicPageMetadata } from '@/lib/publicPages';

export const dynamic = 'force-dynamic';
export const metadata = publicPageMetadata('/makers');

export default async function MakersPage({ searchParams }: { searchParams: Promise<{ town?: string | string[]; kind?: string; q?: string; page?: string | string[] }> }) {
  const filters = await searchParams;
  const town = typeof filters.town === 'string' ? filters.town.trim().slice(0, 100) : '';
  const page = typeof filters.page === 'string' && /^\d{1,4}$/.test(filters.page) ? Math.max(1, Number(filters.page)) : 1;
  const pageSize = 12;
  const kind = makerKinds.find(value => value === filters.kind);
  const q = typeof filters.q === 'string' ? filters.q.trim().slice(0,100) : '';
  const match = { contains: q, mode: 'insensitive' as const };
  const itemFilter = { published: true, ...(kind ? { kind } : {}) };
  const where = { ...publicMakerWhere, ...(kind ? { makerItems: { some: itemFilter } } : {}), ...(q ? { OR: [{name: match}, {makerItems: {some: {...itemFilter, name: match}}}] } : {}), ...(town ? { makerTown: { contains: town, mode: 'insensitive' as const } } : {}) };
  const [items, batches, makers, stories] = await Promise.all([
    prisma.makerItem.findMany({ where: { ...itemFilter, supplier: where, ...(q ? { OR: [{name: match}, {supplier: {name: match}}] } : {}) },
      skip: (page-1)*pageSize, take: pageSize+1, orderBy: [{createdAt: 'desc'},{id: 'asc'}],
      select: { ...publicItemSelect, supplier: {select: {makerHandle: true}} } }),
    prisma.makerBatch.findMany({
      where: { ...openBatches(), item: { ...itemFilter, supplier: where, ...(q ? { OR: [{name: match}, {supplier: {name: match}}] } : {}) } },
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
  const pageLink = (next: number) => `/makers?${new URLSearchParams({ ...(town ? { town } : {}), ...(kind ? {kind} : {}), ...(q ? {q} : {}), page: String(next) })}`;

  return <main className="bg-background pb-16">
    <header className="border-b border-border bg-brand-cream">
      <div className="editorial-wrap py-12 md:py-20">
        <h1 className="max-w-3xl font-serif text-5xl leading-tight text-brand-green md:text-7xl">Fresh near you.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Find what local bakers, cooks, growers and food makers are preparing, and enquire with them directly.</p>
        <form action="/makers" className="mt-6 flex max-w-4xl flex-wrap items-end gap-3">
          <label htmlFor="maker-town" className="flex-1 space-y-2 text-sm font-semibold">
            <span>Town</span>
            <input id="maker-town" name="town" defaultValue={town} maxLength={100} placeholder="e.g. Nawala" className="block min-h-11 w-full rounded-lg border border-border bg-background px-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">Search<input className="min-h-11 rounded-lg border px-3" name="q" defaultValue={q} placeholder="Item or maker" /></label>
          <label className="grid gap-2 text-sm font-semibold">Craft<select name="kind" defaultValue={kind || ''} className="min-h-11 rounded-lg border px-3"><option value="">All crafts</option>{makerKinds.map(value => <option key={value}>{value}</option>)}</select></label>
          <button className="min-h-11 rounded-lg bg-brand-green px-5 font-semibold text-white">Find makers</button>
        </form>
        {(town || q || kind) && <Link href="/makers" className="mt-3 inline-block text-sm underline">Clear filters</Link>}
      </div>
    </header>
    <div className="editorial-wrap space-y-12 py-10">
      <section>
        <h2 className="editorial-title">The item board</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.slice(0,pageSize).map(item => <MakerItemCard key={item.id} item={item} handle={item.supplier.makerHandle}/>)}</div>
        {!items.length && <p className="text-muted-foreground">No published items match this selection.</p>}
      </section>
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
        <Link href="/join" className="mt-5 inline-block text-sm font-semibold text-brand-green underline">Join FreshPick as a maker</Link>
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
        {[items, batches, makers, stories].some(results => results.length > pageSize) && <Link href={pageLink(page + 1)}>Next page</Link>}
      </nav>
    </div>
  </main>;
}
