import Link from "next/link";
import { PageBand } from "@/components/makers/Edition";
import { ArrowUpRight } from "lucide-react";
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

      <PageBand title="The editorial archive." intro="Food writing and guides from earlier FreshPick editions." image="/images/editorial/kitchen-basket.webp" alt="Fresh vegetables and herbs on a kitchen table"/>

      {featured && (
        <section className="editorial-wrap py-8 md:py-12" aria-labelledby="featured-story-heading">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <h2 id="featured-story-heading" className="font-heading text-2xl font-semibold tracking-[-.035em] text-brand-green-deep sm:text-3xl">Featured story</h2>

          </div>
          <article className="grid min-w-0 overflow-hidden rounded-[4px] bg-brand-green-deep text-white lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)]">
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
              <Link href={featuredHref} className="mt-8 inline-flex min-h-12 w-fit items-center gap-3 rounded-[3px] bg-white px-6 py-3 text-sm font-semibold text-brand-green-deep transition-colors hover:bg-brand-cream">
                Read the story <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </section>
      )}

      {remainingGuides.length > 0 && (
        <section className="border-y border-brand-green/10 bg-white/45 py-8 md:py-12" aria-labelledby="guides-heading">
          <div className="editorial-wrap">
            <div className="mb-9 grid gap-4 md:grid-cols-[1fr_.8fr] md:items-end">
              <div>
                <p className="text-sm font-semibold text-brand-green">Practical reading</p>
                <h2 id="guides-heading" className="mt-3 max-w-[19ch] font-heading text-[clamp(2.15rem,4vw,3.8rem)] font-semibold leading-[1.1] tracking-[-.045em] text-brand-green-deep">From the archive.</h2>
              </div>
              <p className="max-w-md text-base leading-8 text-muted-foreground md:justify-self-end">Earlier FreshPick guides to pantry ingredients and everyday food planning.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {remainingGuides.map((guide) => (
                <JournalCard key={guide.slug} post={{ ...guide, id: guide._id }} href={guidePath(guide.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="editorial-wrap py-8 md:py-12" aria-labelledby="stories-heading">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-brand-green">From the market</p>
            <h2 id="stories-heading" className="mt-3 font-heading text-[clamp(2.2rem,4.5vw,4rem)] font-semibold leading-[1.08] tracking-[-.045em] text-brand-green-deep">More stories to explore.</h2>
          </div>
          <Link href="/makers" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-green hover:underline">Explore makers <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
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
