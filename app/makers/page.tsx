import Link from 'next/link';
import Image from 'next/image';
import { GuideShelf } from '@/components/discovery/Editorial';
import { ProspectCard } from '@/components/discovery/Directory';
import { listProspects } from '@/lib/discovery';
import { Search, MapPin } from 'lucide-react';
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
  const [items, batches, makers, stories, prospects] = await Promise.all([
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
    !kind?listProspects('makers',q,town,page).catch(error=>{console.error('Maker prospects',error);return []}):Promise.resolve([]),
  ]);
  const pageLink = (next: number) => `/makers?${new URLSearchParams({ ...(town ? { town } : {}), ...(kind ? {kind} : {}), ...(q ? {q} : {}), page: String(next) })}`;

  const craftLink = (value?: string) => `/makers?${new URLSearchParams({ ...(town ? {town} : {}), ...(q ? {q} : {}), ...(value ? {kind:value} : {}) })}`;
  const hasResults = [items, batches, makers, stories, prospects].some(rows => rows.length > 0);
  const filtered = Boolean(town || kind || q || page > 1);
  const launch = !hasResults && !filtered;
  return <div className="fp-directory directory-experience">
    <header className={`directory-masthead ${filtered ? "directory-masthead-compact" : ""}`}>
      <div className="editorial-wrap directory-masthead-inner">
        <div className="directory-masthead-copy"><p className="studio-overline">The FreshPick directory</p><h1>Meet the makers.</h1><p>Discover independent food makers, near you and across Sri Lanka.</p></div>
        {!filtered && <div className="directory-masthead-photo"><Image src="/images/editorial/kitchen-basket.webp" alt="A woven basket of fresh ingredients" fill priority sizes="(max-width:767px) 90vw, 48vw"/></div>}
      </div>
    </header>
    <div className="editorial-wrap lux-directory-controls directory-search-panel">
        <nav className="lux-craft-tabs" aria-label="Browse by craft">{[undefined,...makerKinds].map(value => <Link key={value || "all"} href={craftLink(value)} aria-current={kind === value ? "page" : undefined}>{value || "All crafts"}</Link>)}</nav>
        <form action="/makers" className="directory-search-form" role="search">
          {kind && <input type="hidden" name="kind" value={kind}/>}
          <label className="directory-search-field"><Search size={20} aria-hidden="true"/><span><span className="directory-field-label">What are you looking for?</span><input name="q" maxLength={100} defaultValue={q} placeholder="Food or maker name"/></span></label>
          <label className="directory-search-field"><MapPin size={20} aria-hidden="true"/><span><span className="directory-field-label">Where?</span><input id="maker-town" name="town" maxLength={100} defaultValue={town} placeholder="Any town"/></span></label>
          <button className="modern-primary" type="submit">Find makers <ArrowUpRight size={17} aria-hidden="true"/></button>
        </form>
        {(town || q || kind) && <Link href="/makers" className="mt-3 inline-block text-sm underline">Clear filters</Link>}
    </div>
    <div className="editorial-wrap lux-directory-results directory-results space-y-9 py-7">
      {(makers.length>0||items.length>0||batches.length>0||stories.length>0) && <nav className="lux-result-jump" aria-label="Jump to results">{makers.length > 0 && <a href="#makers-results">Makers</a>}{items.length > 0 && <a href="#items-results">Food</a>}{batches.length > 0 && <a href="#batches-results">Preorders</a>}{stories.length > 0 && <a href="#stories-results">Stories</a>}</nav>}
      {(makers.length>0||items.length>0) && <p className="journal-results-summary" aria-live="polite">{makers.length > pageSize ? `${pageSize}+` : makers.length} makers · {items.length > pageSize ? `${pageSize}+` : items.length} items on this page</p>}
      {makers.length > 0 && <section id="makers-results">
        <h2 className="editorial-title">Meet the makers</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-studio-grid>
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
        <div className="mt-5 journal-item-grid" data-studio-grid>{items.slice(0,pageSize).map(item => <MakerItemCard key={item.id} item={item} handle={item.supplier.makerHandle} makerName={item.supplier.name} makerTown={item.supplier.makerTown}/>)}</div>
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
      {prospects.length>0&&<section aria-label="Independent maker profiles"><h2 className="editorial-title">Independent food businesses</h2><div className="fp26-resultgrid mt-5">{prospects.slice(0,24).map(b=><ProspectCard key={b.id} business={b}/>)}</div></section>}
      {!hasResults && <section className="directory-status" aria-live="polite">
        <div><p className="studio-overline">{launch ? 'Coming to FreshPick' : 'Search results'}</p>
          <h2>{filtered ? 'No matches this time.' : 'The directory is opening.'}</h2>
          <p>{filtered ? 'Try a nearby town, a different craft, or browse all makers.' : 'Independent makers will appear here as their pages are approved and published. In the meantime, explore the food journal or introduce your own kitchen.'}</p>
        </div>
        {filtered ? <Link className="modern-primary" href="/makers">See all makers</Link> : <Link className="studio-outline-action" href="/stories">Explore the journal <ArrowUpRight size={17} aria-hidden="true"/></Link>}
      </section>}
      {(page > 1 || ([items, batches, makers, stories].some(results => results.length > pageSize)||prospects.length>24)) && <nav aria-label="Maker discovery pages" className="flex gap-5 text-sm font-semibold text-brand-green">
        {page > 1 && <Link href={pageLink(page - 1)}>Previous page</Link>}
        {([items, batches, makers, stories].some(results => results.length > pageSize)||prospects.length>24) && <Link href={pageLink(page + 1)}>Next page</Link>}
      </nav>}
    </div>
    {launch && <div className="fp26-shell"><GuideShelf slugs={["the-bread-window","a-place-for-pepper","a-basket-of-greens"]} heading="Meet the world of local food"/></div>}
  </div>;
}
