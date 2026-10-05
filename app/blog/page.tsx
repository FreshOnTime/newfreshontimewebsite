import { publicPageMetadata } from '@/lib/publicPages';
import { BlogList } from '@/components/blog/BlogList';
import JournalCard from '@/components/blog/JournalCard';
import BlogImage from '@/components/blog/BlogImage';
import { firstJournalPage } from '@/lib/journalService';
import { editorialGuides, guidePath } from '@/lib/editorialGuides';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/config/site';
import prisma from '@/lib/prisma';

export const revalidate = 60;
export const metadata = publicPageMetadata('/blog');

export default async function BlogPage() {
  const guideSlugs = editorialGuides.map(guide => guide.slug);
  const [initialData, managedGuides] = await Promise.all([
    firstJournalPage().catch(() => null),
    Promise.resolve(prisma.blog.findMany({
      where: { slug: { in: guideSlugs } },
      select: { slug: true },
    })).catch(() => []),
  ]);

  const managedSlugs = new Set(managedGuides.map(guide => guide.slug));
  const fallbackGuides = editorialGuides.filter(guide => !managedSlugs.has(guide.slug));

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border">
        <div className="editorial-wrap grid items-center gap-8 py-9 md:grid-cols-[1.15fr_0.85fr] md:gap-14 md:py-12">
          <div>
            <p className="editorial-label mb-4">The FreshPick blog</p>
            <h1 className="font-heading text-4xl font-normal leading-tight md:text-5xl">Good food starts with a little planning.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Practical grocery guides, pantry ideas and everyday cooking inspiration for households in Colombo and Sri Lanka.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
            <BlogImage src="/images/editorial/kitchen-basket.webp" alt="A basket of vegetables and herbs on a kitchen table" priority sizes="(max-width: 767px) calc(100vw - 40px), 45vw" />
          </div>
        </div>
      </section>

      {fallbackGuides.length > 0 && (
        <section className="editorial-wrap py-10 md:py-14" aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="text-2xl font-normal md:text-3xl">Practical guides for your next shop</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Start with a useful checklist, build a weekly list or find a basket that fits your routine.</p>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackGuides.map(guide => (
              <JournalCard key={guide.slug} post={{ ...guide, id: guide._id }} href={guidePath(guide.slug)} />
            ))}
          </div>
        </section>
      )}

      {(!initialData || initialData.pagination.total > 0) && (
        <section className="editorial-wrap border-t border-border py-10 md:py-14" aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="mb-8 text-2xl font-normal">More from the market</h2>
          <BlogList initialData={initialData} />
        </section>
      )}

      {fallbackGuides.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'FreshPick grocery guides',
            itemListElement: fallbackGuides.map((guide, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: guide.title,
              url: absoluteUrl(guidePath(guide.slug)),
            })),
          }}
        />
      )}
    </div>
  );
}
