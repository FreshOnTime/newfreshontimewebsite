# Public discovery and ordering improvements

> Current carousel, navigation and recipe scope: [Editorial market](EDITORIAL_MARKET.md). The earlier implementation notes below are historical.

This update keeps the approved FreshPick market banner and editorial design, and fixes public discovery and ordering issues found in the current application.

## Bugs corrected

- Public pages previously inherited the homepage canonical URL. Public routes now have their own canonical, title, description and share metadata. Catalogue pagination keeps a page-specific canonical; faceted/search catalogue URLs are marked noindex, follow.
- Account, checkout, admin and dashboard routes now have explicit noindex metadata. Rendering assets are no longer blocked by robots.txt.
- Referenced share images and organization logos did not exist. A generated Next.js Open Graph image and real SVG wordmark now supply those assets.
- Editorial text could prematurely close a JSON-LD script. Shared serialization escapes HTML-sensitive characters without changing the decoded data.
- The sitemap omitted journal posts and several public destinations. It now includes public pages, published journal articles, valid published recipes and collections, products, active categories and recipe creators. Failed source queries do not discard healthy sections; malformed commerce content and private routes are excluded. Modification dates come from records, rather than the time of every sitemap request.
- Delivery & ordering linked to a feedback destination. `/help` now provides ordering support, while `/help-us` remains feedback.
- Recipe basket estimates ignored product discounts. Ingredient totals and the estimate now use the same discounted unit-price helper as commerce flows.
- Invalid journal pagination could reach Prisma and produce a server error. Invalid page/limit inputs now return HTTP 400.
- Creator metadata could repeat the brand name. Creator titles now describe their recipes.

## SEO, GEO and AEO

GEO here means generative engine optimization; AEO means answer engine optimization. The implementation improves the factual, accessible content these systems can read:

- Journal summaries are included in the initial HTML, with search, retry and pagination retained.
- Article pages include public author names, publication dates, accurate BlogPosting data and breadcrumbs. Markdown titles no longer introduce a second level-one heading.
- A delivery and ordering help page answers six common questions, with visible text matching its FAQ schema. The homepage includes three of these answers and a direct help link.
- Shared brand URLs, currency, service areas and support contact provide consistent entity information. No unverified physical storefront coordinates or invented ratings are advertised.
- Product offer prices and availability retain the application's actual product data; recipe schema no longer labels every recipe as dinner.

These changes do not guarantee rankings, AI citations, indexing or FAQ rich results. No special AI-only schema or text file is required for this update. Delivery answers are based on configured service areas and existing checkout behavior, and avoid promising a delivery time the application does not guarantee.

## Verification

Recorded results are from the local production build with deterministic database fixtures, not production customer data:

- Production build, TypeScript and ESLint checks pass.
- 158 unit/API tests pass across 20 suites, including new discovery and invalid-query regression tests.
- Browser verification passes for 35 public route variants and eight private routes, checking canonical URLs, JSON-LD, noindex metadata, journal HTML, discounted totals, share assets and sitemap publication changes.
- All 16 responsive checks pass on fully rendered pages: homepage, help, journal and recipe detail at 1440, 820, 390 and 320 pixels.
- Interactive verification passes for journal search and the help-to-contact link, with no page errors.
- All six HTTP smoke tests pass against the local running application.

The pull request records the final browser and smoke totals. Production indexing and performance should be observed after deployment through Search Console and the site's analytics; neither was measured here.

## Primary references

- Google AI features and website guidance: https://developers.google.com/search/docs/appearance/ai-features
- Google canonical URL guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google robots.txt guidance: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Next.js JSON-LD serialization guidance: https://nextjs.org/docs/app/guides/json-ld
