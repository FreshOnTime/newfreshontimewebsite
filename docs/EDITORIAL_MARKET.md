# FreshPick editorial market

The current storefront takes inspiration from Natoora's large food photography,
short headlines and visible story/business links. FreshPick keeps its own Arial
font stack, ivory `#F8F7F2`, green `#2F6B45` and amber `#E6A23C` palette, existing
categories and real catalogue data. This document supersedes the earlier
recipe, journal-navigation and single-banner design notes.

## Homepage

The homepage has three photographic highlights: food at the table; bakery and
pantry; independent makers. Categories immediately follow the banner and remain
the first shopping destination. Product listings and the existing brand story
remain, followed by the latest published **Blog** stories and ordering answers.

The carousel renders the first image/headline/link in server HTML. The first
image has priority and responsive `next/image` sizing. Other images are lazy
loaded. Heights are reserved at all breakpoints; copy and controls are HTML.
Images have alt text and controls have descriptive accessible names.

Highlights advance every eight seconds. A pause/play control is always present.
Hover pauses rotation; focus on the carousel content and manual navigation stop
automatic rotation until the user presses play. The playback button controls
rotation directly and keeps focus when its icon changes. Reduced-motion users start with rotation
off. Hidden tabs pause rotation. Previous/next buttons wrap; numbered buttons
select a highlight. Arrow keys work when the carousel region itself has focus.
Only the active photo is visible, with one headline and one primary action.
The live region is silent during automatic rotation and polite during manual
navigation. Timer and media/visibility listeners are cleaned up on unmount.

## Navigation and business

Desktop and mobile share `lib/navigation.ts`: Categories, Shop all, Weekly
baskets, Our producers, About, Blog and For business. There is no More menu or
separate Recipes, Sell with FreshPick or Delivery & ordering navbar entry.
Contact remains in the mobile menu and footer. Help remains accessible from the
footer and existing order flows.

`/b2b` is the single For business destination. Buyers can discuss supply needs
through the existing enquiry form; growers, food makers and brands can use the
existing supplier application. Buying and selling have separate, clear actions
on the same page. Enquiries continue to reach the existing admin business inbox.
Supplier onboarding, review and permissions are unchanged.

Blog is the public/admin name throughout; URLs, CMS records and cache keys are
unchanged. The footer retains its restored structure and large brand name,
without the small cream logo badge.

## Recipe retirement

The recipe studio, public recipe pages, recipe APIs (including add-to-bag),
recipe services/models and recipe MCP tools are removed. Recipe-only creator
pages and meal-kit pages are also removed. Legacy page URLs redirect:

| Old destination | New destination |
| --- | --- |
| `/recipes/*`, `/meal-kits/*` | `/products` |
| `/creators/*` | `/farm-to-table` |
| `/admin/recipes/*` | `/admin/blogs` |

Removed public/admin recipe API URLs return 404 and cannot mutate bags or CMS
content. The public MCP server exposes only `search_products`, `get_product`
and `list_categories`; old recipe tool calls return a protocol error.

Search, discovery, site maps, metadata, help and collection editors no longer
advertise recipes. Collections require a product. Old mixed collections still
parse their product IDs and ignore recipe links; recipe-only collections are
excluded until an administrator attaches products. Recipe rows already stored
in the shared Blog table are retained, excluded from all public/editorial feeds
and inaccessible through the blog editor. There is no destructive migration or
production record deletion. Existing saved bags remain ordinary shopping bags.

## Banner assets

Two illustrative editorial images were made with the built-in image generation
tool. They represent food culture, not a named supplier, actual listing,
confirmed menu or basket contents. Product cards retain catalogue photography.
Both are locally hosted WebP files at 1672 × 941:

- `public/images/home/market-table.webp`
- `public/images/home/market-bakery.webp`

The third slide reuses `public/images/editorial/hands-at-work.webp`; its original
photographer/source/license are in [editorial credits](../public/images/editorial/CREDITS.md).

### Generation prompts

**Table:** Premium editorial photograph of a contemporary Sri Lankan breakfast
table. Ivory linen on weathered wood, golden coconut roti on a ceramic plate,
small bowls of coconut sambol and dhal, amber tea in a carafe and tumbler,
rustic bread on creased paper. Sparse composition with food toward middle/right
and a shaded bottom-left tabletop for HTML copy. Soft morning light, honest
texture, natural shadows, subtle grain, three-quarter overhead angle. No
people, hands, logos, labels, text, fruit pile, glossy CGI or artificial glow.
Wide 16:9 photograph, no UI or baked headline.

**Bakery:** Premium food editorial photo of rustic sourdough on a weathered
board, two flaky pastries on brown paper, an unlabeled jar of marmalade and an
ivory cup of coffee on charcoal stone. Soft daylight from the right, tactile
crumbs, believable crust, natural shadows and muted warm film photography.
Sparse arrangement across middle/right, mostly clear dark bottom-left tabletop
for HTML copy. No fruit/vegetable pile, people, hands, logos, labels, text,
watermark, CGI, artificial glow or symmetry. Wide 16:9 photograph, no UI or
baked headline.

## Verification

Check all carousel slides at 320, 390, 820, 1280 and 1440px; every desktop/mobile
navigation link; the category action; pause/play, wrapping, keyboard focus,
reduced motion and hidden tabs. Check Blog labels/search, both business paths,
product-only collections, historical recipe exclusion, retired redirects/API
URLs, sitemap and MCP tools. Use isolated local fixtures, never production
customer or content records.
