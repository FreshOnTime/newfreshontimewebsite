import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { publicPageMetadata } from "@/lib/publicPages";
import { BlogList } from "@/components/blog/BlogList";
import JournalCard from "@/components/blog/JournalCard";
import BlogImage from "@/components/blog/BlogImage";
import { firstJournalPage } from "@/lib/journalService";
import { editorialGuides, guidePath } from "@/lib/editorialGuides";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/config/site";
import prisma from "@/lib/prisma";

export const revalidate = 60;
export const metadata = publicPageMetadata("/blog");

export default async function BlogPage() {
  const guideSlugs = editorialGuides.map((guide) => guide.slug);
  const [initialData, managedGuides] = await Promise.all([
    firstJournalPage().catch(() => null),
    prisma.blog.findMany({
      where: { slug: { in: guideSlugs } },
      select: { slug: true },
    }).catch(() => []),
  ]);

  const managedSlugs = new Set(managedGuides.map((guide) => guide.slug));
  const fallbackGuides = editorialGuides.filter((guide) => !managedSlugs.has(guide.slug));
  const featuredCms = initialData?.blogs[0];
  const featuredGuide = featuredCms ? null : fallbackGuides[0];
  const featured = featuredCms || featuredGuide;
  const featuredHref = featuredCms
    ? "/blog/" + encodeURIComponent(featuredCms.slug)
    : featuredGuide ? guidePath(featuredGuide.slug) : "";
  const featuredDate = featured?.publishedAt ? new Date(featured.publishedAt) : null;
  const validDate = featuredDate && Number.isFinite(featuredDate.getTime()) ? featuredDate : null;
  const remainingGuides = fallbackGuides.filter((guide) => guide.slug !== featuredGuide?.slug);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": absoluteUrl("/blog#blog"),
        name: "The FreshPick Journal",
        url: absoluteUrl("/blog"),
        description: "Practical grocery guides, Sri Lankan pantry ideas, everyday food planning and market stories from FreshPick.",
        publisher: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en-LK",
      }} />

      <section className="overflow-hidden border-b border-brand-green/10 bg-brand-cream">
        <div className="editorial-wrap grid items-center gap-9 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,.97fr)] lg:gap-16 lg:py-20">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-green">The FreshPick Journal</p>
            <h1 className="mt-5 max-w-[13ch] font-heading text-[clamp(3.1rem,6.2vw,6.4rem)] font-semibold leading-[1.02] tracking-[-.058em] text-brand-green-deep">
              Good food has a story.
            </h1>
            <p className="mt-7 max-w-[48ch] text-base leading-8 text-foreground/75 sm:text-lg">
              Thoughtful notes on the food we cook, the markets we shop and the little rituals that make everyday life better.
            </p>
            <Link href="#stories-heading" className="mt-8 inline-flex min-h-12 items-center gap-3 border-b border-brand-green/40 text-sm font-semibold text-brand-green transition-colors hover:border-brand-green">
              Explore the journal <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] bg-secondary sm:min-h-[430px] lg:min-h-[520px] lg:rounded-[2rem]">
            <BlogImage src="/images/editorial/kitchen-basket.webp" alt="Fresh vegetables and herbs on a kitchen table" priority sizes="(max-width: 1023px) 100vw, 48vw" />
          </div>
        </div>
      </section>

      {featured && (
        <section className="editorial-wrap py-14 md:py-20" aria-labelledby="featured-story-heading">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <h2 id="featured-story-heading" className="font-heading text-2xl font-semibold tracking-[-.035em] text-brand-green-deep sm:text-3xl">Featured story</h2>
            <span className="text-sm text-muted-foreground">A good place to start reading</span>
          </div>
          <article className="grid min-w-0 overflow-hidden rounded-[1.5rem] bg-brand-green-deep text-white lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] lg:rounded-[2rem]">
            <Link href={featuredHref} aria-label={"Read " + featured.title} className="group relative block min-h-[290px] overflow-hidden bg-brand-green sm:min-h-[420px] lg:min-h-[490px]">
              <BlogImage src={featured.featuredImage?.url || "/images/editorial/market-crates.webp"} alt={featured.featuredImage?.alt || featured.title} sizes="(max-width: 1023px) 100vw, 55vw" />
              <span aria-hidden="true" className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-black/15" />
            </Link>
            <div className="flex min-w-0 flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-white/75">
                <span>{featured.category || "From the market"}</span>
                {validDate && <><span aria-hidden="true">·</span><time dateTime={validDate.toISOString()}>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Colombo" }).format(validDate)}</time></>}
              </div>
              <h3 className="mt-6 max-w-[21ch] font-heading text-[clamp(2rem,3.2vw,3.5rem)] font-semibold leading-[1.12] tracking-[-.045em] text-white">{featured.title}</h3>
              <p className="mt-5 max-w-[47ch] text-base leading-8 text-white/80">{featured.excerpt}</p>
              <Link href={featuredHref} className="mt-8 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-green-deep transition-colors hover:bg-brand-cream">
                Read the story <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </section>
      )}

      {remainingGuides.length > 0 && (
        <section className="border-y border-brand-green/10 bg-white/45 py-14 md:py-20" aria-labelledby="guides-heading">
          <div className="editorial-wrap">
            <div className="mb-9 grid gap-4 md:grid-cols-[1fr_.8fr] md:items-end">
              <div>
                <p className="text-sm font-semibold text-brand-green">Practical reading</p>
                <h2 id="guides-heading" className="mt-3 max-w-[19ch] font-heading text-[clamp(2.15rem,4vw,3.8rem)] font-semibold leading-[1.1] tracking-[-.045em] text-brand-green-deep">Make everyday shopping a little easier.</h2>
              </div>
              <p className="max-w-md text-base leading-8 text-muted-foreground md:justify-self-end">Useful guides for the shopping list, the pantry and the decisions you make before checkout.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {remainingGuides.map((guide) => (
                <JournalCard key={guide.slug} post={{ ...guide, id: guide._id }} href={guidePath(guide.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="editorial-wrap py-14 md:py-20" aria-labelledby="stories-heading">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-brand-green">From the market</p>
            <h2 id="stories-heading" className="mt-3 font-heading text-[clamp(2.2rem,4.5vw,4rem)] font-semibold leading-[1.08] tracking-[-.045em] text-brand-green-deep">More stories to explore.</h2>
          </div>
          <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-green hover:underline">Visit the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <BlogList initialData={initialData} featuredSlug={featuredCms?.slug} />
      </section>

      {fallbackGuides.length > 0 && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "FreshPick grocery guides",
          itemListElement: fallbackGuides.map((guide, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: guide.title,
            url: absoluteUrl(guidePath(guide.slug)),
          })),
        }} />
      )}
    </div>
  );
}
