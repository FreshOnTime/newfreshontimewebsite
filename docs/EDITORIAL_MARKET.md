# FreshPick editorial market

The current storefront takes inspiration from Natoora's large food photography,
short headlines and visible story/business links. FreshPick keeps its own Arial
font stack, ivory `#F8F7F2`, green `#2F6B45` and amber `#E6A23C` palette, existing
categories and real catalogue data. This document supersedes the earlier
recipe, journal-navigation and single-banner design notes.

## Homepage

The homepage has three photographic highlights: a fresh vegetable box; tropical
fruit and fresh produce; raw pantry staples and tea. Categories immediately follow the banner and remain
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

## Wordmark

The shared wordmark uses uppercase letters, medium weight and tighter spacing,
with Fresh in green and Pick in clay. Navbar, account/checkout chrome, footer
and the public SVG use the same typographic direction. The footer uses white
on green and retains its restored layout without a logo badge.

The brand font stack is Helvetica Now Text, Helvetica Neue, Helvetica, Arial,
sans-serif. Helvetica Now Text was observed on Natoora's page. No commercial
font files were downloaded or bundled: supported installed fonts are used,
otherwise the logo falls back to the next family. Exact cross-device Helvetica
Now rendering requires a licensed webfont file. Body/page typography remains
the previous Arial stack. This is an original FreshPick wordmark treatment.

## Banner assets

Natoora's terms require a licence for commercial reuse of its site content.
Reference photography and logo files were not copied or hotlinked.

Three original campaign images are used; they are illustrative artwork rather
than proof of a specific producer, basket contents or stock. Actual product
cards retain catalogue photographs.

- `public/images/home/market-produce-box.webp`: generated for this revision with
  the built-in image-generation tool, 1672 × 941, optimized to WebP.
- `public/images/home/fresh-market-hero.webp`: existing original mixed-produce
  campaign artwork; see `public/images/home/CREDITS.md` for provenance.
- `public/images/home/market-pantry.webp`: generated for this revision with the
  built-in image-generation tool, 1672 × 941, optimized to WebP.

The cooked-table/bakery hero assets are retired. Discover now uses the fresh
produce-box banner. Blog, business and category journeys remain available.

### Generation prompts

**Produce box** (photorealistic-natural): An original wide editorial photograph
of an unbranded kraft produce crate on charcoal slate. Fresh aubergines, cabbage,
carrots with tops, green beans, pumpkin, limes, cucumbers, avocados and red onions
are loosely packed in brown paper. Three-quarter overhead view, produce mostly
centre/right, dark space left for HTML copy and mobile-safe centre cropping.
Natural daylight, tactile imperfections, rich greens and earthy orange/violet,
subtle grain. No cooked food, bread, plates, utensils, people, logos, labels,
printed artwork, watermarks, symmetrical piles, CGI or artificial saturation.

**Pantry** (photorealistic-natural): An original wide food editorial photograph
of uncooked red rice and lentils in plain paper bags, cinnamon and cardamom in
a ceramic bowl, whole/half coconut, an unbranded amber corked bottle and loose
black tea in a kraft pouch. Charcoal brown stone, creased paper, centre/right
subjects and dark space left for HTML copy. Directional daylight, earthy tones,
real textures, deep natural shadows and mobile-safe cropping. No cooked dishes,
bread, table settings, people, labels, logos, watermarks, excessive props, CGI
or symmetrical staging.

## Verification

Check all carousel slides at 320, 390, 820, 1280 and 1440px; every desktop/mobile
navigation link; the category action; pause/play, wrapping, keyboard focus,
reduced motion and hidden tabs. Check Blog labels/search, both business paths,
product-only collections, historical recipe exclusion, retired redirects/API
URLs, sitemap and MCP tools. Use isolated local fixtures, never production
customer or content records.
