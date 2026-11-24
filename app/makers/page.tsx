import Link from 'next/link';
import { PageBand } from '@/components/makers/Edition';
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
      select: { ...publicItemSelect, supplier: {select: {makerHandle: true, name: true, makerTown: true}} } }),
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

  const craftLink = (value?: string) => `/makers?${new URLSearchParams({ ...(town ? {town} : {}), ...(q ? {q} : {}), ...(value ? {kind:value} : {}) })}`;
  const hasResults = [items, batches, makers, stories].some(rows => rows.length > 0);
  const filtered = Boolean(town || kind || q || page > 1);
  return <div className="fp-directory">
    <PageBand title="The maker directory." intro="Find a baker around the corner, a kitchen taking preorders or a grower near home."/>
    <div className="editorial-wrap lux-directory-controls">
        <nav className="lux-craft-tabs" aria-label="Browse by craft">{[undefined,...makerKinds].map(value => <Link key={value || "all"} href={craftLink(value)} aria-current={kind === value ? "page" : undefined}>{value || "All crafts"}</Link>)}</nav>
        <form action="/makers" className="fp-filters">
          <label htmlFor="maker-town" className="flex-1 space-y-2 text-sm font-semibold">
            <span>Town</span>
            <input id="maker-town" name="town" defaultValue={town} maxLength={100} placeholder="e.g. Nawala" className="block min-h-11 w-full rounded-lg border border-border bg-background px-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">Search<input className="min-h-11 rounded-lg border px-3" name="q" maxLength={100} defaultValue={q} placeholder="Item or maker" /></label>
          <label className="grid gap-2 text-sm font-semibold">Craft<select name="kind" defaultValue={kind || ''} className="min-h-11 rounded-lg border px-3"><option value="">All crafts</option>{makerKinds.map(value => <option key={value}>{value}</option>)}</select></label>
          <button className="min-h-11 rounded-lg bg-brand-green px-5 font-semibold text-white">Find makers</button>
        </form>
        {(town || q || kind) && <Link href="/makers" className="mt-3 inline-block text-sm underline">Clear filters</Link>}
    </div>
    <div className="editorial-wrap lux-directory-results space-y-9 py-7">
      {hasResults && <nav className="lux-result-jump" aria-label="Jump to results">{makers.length > 0 && <a href="#makers-results">Makers</a>}{items.length > 0 && <a href="#items-results">Food</a>}{batches.length > 0 && <a href="#batches-results">Preorders</a>}{stories.length > 0 && <a href="#stories-results">Stories</a>}</nav>}
      {hasResults && <p className="journal-results-summary" aria-live="polite">{makers.length > pageSize ? `${pageSize}+` : makers.length} makers · {items.length > pageSize ? `${pageSize}+` : items.length} items on this page</p>}
      {makers.length > 0 && <section id="makers-results">
        <h2 className="editorial-title">Meet the makers</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {makers.slice(0, pageSize).map(maker => <Link key={maker.id} href={`/makers/${maker.makerHandle}`} className="journal-index-entry">
            <h3 className="flex items-center justify-between gap-3 font-serif text-xl text-brand-green">{maker.name}<ArrowUpRight className="shrink-0" size={16} aria-hidden="true" /></h3>
            <p className="mt-1 text-sm text-muted-foreground">{maker.makerTown}</p>
            {maker.makerBio && <p className="mt-2 line-clamp-2 break-words text-sm">{maker.makerBio}</p>}
          </Link>)}
        </div>
        <Link href="/join" className="mt-5 inline-block text-sm font-semibold text-brand-green underline">Join FreshPick as a maker</Link>
      </section>}
      {items.length > 0 && <section id="items-results">
        <h2 className="editorial-title">The item board</h2>
        <div className="mt-5 journal-item-grid">{items.slice(0,pageSize).map(item => <MakerItemCard key={item.id} item={item} handle={item.supplier.makerHandle} makerName={item.supplier.name} makerTown={item.supplier.makerTown}/>)}</div>
      </section>}
      {batches.length > 0 && <section id="batches-results">
        <h2 className="editorial-title">Open for preorders</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.slice(0, pageSize).map(batch => {
            const { item } = batch;
            const shop = item.supplier;
            return <article key={batch.id} className="journal-batch">
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
      </section>}
      {stories.length > 0 && <section id="stories-results">
        <h2 className="editorial-title">Stories from makers</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, pageSize).map(story => <Link key={story.id} href={`/makers/${story.supplier?.makerHandle}/stories/${story.slug}`} className="journal-index-entry">
            <p className="text-sm text-muted-foreground">{story.supplier?.name}</p>
            <h3 className="mt-1 font-serif text-xl text-brand-green">{story.title}</h3>
            <p className="mt-2 line-clamp-2 break-words text-sm">{story.excerpt}</p>
          </Link>)}
        </div>
      </section>}
      {!hasResults && <div className="fp-empty">
        <div><h2>{filtered ? 'No matches this time.' : 'The directory is opening.'}</h2>
        <p>{filtered ? 'Try a nearby town, a different craft, or browse all makers.' : 'Maker pages appear here as they publish. If you make food, introduce your kitchen to the directory.'}</p></div>
        <Link className="maker-button" href={filtered ? '/makers' : '/join'}>{filtered ? 'See all makers' : 'Start a maker page'}</Link>
      </div>}
      <nav aria-label="Maker discovery pages" className="flex gap-5 text-sm font-semibold text-brand-green">
        {page > 1 && <Link href={pageLink(page - 1)}>Previous page</Link>}
        {[items, batches, makers, stories].some(results => results.length > pageSize) && <Link href={pageLink(page + 1)}>Next page</Link>}
      </nav>
    </div>
  </div>;
}
