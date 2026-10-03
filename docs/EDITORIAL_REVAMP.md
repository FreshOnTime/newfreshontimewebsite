# FreshPick editorial revamp

> Current carousel, navigation and recipe scope: [Editorial market](EDITORIAL_MARKET.md). The earlier implementation notes below are historical.

The visual direction below records the initial revamp. The current typography, palette and homepage composition are documented in [NATOORA_UI.md](NATOORA_UI.md).

Reviewed 2026-10-02. This implements the supplied site-wide editorial food-brand brief on top of the completed checkout and account work.

## Design system

- Deep green `#173F2A`, ivory `#F7F5EE`, cream `#EFECE3`, ink `#151814`, secondary text `#60645E`, sage `#84977A` and white.
- Georgia/Times editorial headings; readable system sans for navigation, body copy, product names, controls and data tables. No remote font request.
- Shared layout widths, section spacing, quiet borders, 6–8px controls and thin Lucide icons. Functional warning/error colours remain distinguishable.
- No gradient heroes, glass surfaces, decorative floating shapes or heavy card shadows. Reduced-motion preferences are respected.
- Real, credited local photography; uploaded category/product/editorial images retain precedence. Stock photographs illustrate the brand, without representing a specific FreshPick farm or producer.

## Page coverage

| Family | Treatment |
| --- | --- |
| Home | Produce-led split hero; photographic category edits; borderless product selection; sourcing story; simple benefits; meals and recurring shopping; recipes; makers; business photography; large newsletter/footer. |
| Shop and deals | Generous grids, large product photos, quiet pricing and discounts, collapsible filters, selected states and sorting. |
| Categories | Shared editorial introductions, photo fallbacks for produce, live product grids, pagination and related category links. |
| Product detail | Large portrait image, serif title, unit pricing, existing quantity/bag controls, sanitised details, delivery/help links and related products from the same category. |
| Search | Products, active categories and recipes; product discovery also matches active category names. |
| Makers, meals, meal ideas, diaspora | Shared photographic page headers, live selection where available and simple editorial rows instead of repeated icon cards. |
| Producers, about and business | Human-facing sourcing copy, honest imagery, larger editorial hierarchy and the existing partnership enquiry form. No fabricated farms, harvest dates or origin claims. |
| Journal, recipes, collections and creators | Large real images, serif titles and quieter story layouts. Removed opaque article-image overlays and the extra fixed journal header. |
| Bags, checkout and account | Existing behaviour retained; consistent controls, neutral summary surfaces, one main landmark. Checkout uses reduced navigation/footer. |
| Authentication | Shared desktop photography frame, consistent forms and a compact account footer; photo is omitted from the mobile layout. |
| Admin and legacy dashboard | Shared tokens, forms, tables, navigation and restrained icons. Fixed duplicate/missing page headings and the broken admin settings link. |
| Policies, help, landing and system states | Shared palette, readable typography, restrained controls and consistent page landmarks. |

## Verification

- Production build and TypeScript checking pass.
- 132 tests pass across 17 unit/API suites.
- ESLint has 0 errors and 55 existing warnings.
- Production Chromium route audit uses isolated sample catalogue/account fixtures: 162 checks across 80 concrete paths (including queries, redirects and 404), plus separate checkout and order-management scenarios. It covers public, authentication, editorial, account, admin and legacy dashboard pages at desktop and phone widths, with additional 320px checks for key public screens. Dynamic paths use representative product/category/recipe/creator/collection records; redirects are followed.
- Browser audit checks meaningful content, page headings, one main landmark, image loading, horizontal overflow and uncaught browser exceptions. Navigation menu, Escape and header search were exercised.
- Checkout browser verification passes at 1440, 1024, 820, 390 and 320px: server quotes; quote failure/retry; stale prices; uncertain-network retries; receipt recovery; discounted quick checkout; subscription checkout.
- Customer order browser verification passes at those five widths: pagination, address validation/save, cancellation confirmation/retry, buy-again failure/partial availability, subscription skip/pause/resume/cancel, history retry and guest return paths.
- Six read-only HTTP smoke tests pass. No live payment-provider transaction, production account mutation or deployment was performed.

Preview catalogue content is sample data used only by local verification. Fixtures are outside the repository and are not shipped. Real catalogue photography and published stories remain managed by the existing APIs/admin workflows.

## Preserved boundaries

Authentication, cart contexts, order APIs, server quote arithmetic, database idempotency, payment/recurrence APIs, authorisation, metadata, JSON-LD and existing catalogue caching remain in place. This change adds read-only discovery queries for category search and related selections. It does not add a fabricated provenance model or replace checkout logic.

Before a production deployment, retain the migration/environment checks in `PLATFORM_READINESS.md`, including the checkout-request migration from the preceding phase. This document records UI verification; it does not mark the platform as production-certified.

## Route inventory

Every existing page route inherits the shared design system. Dynamic routes below were reviewed with representative local records.

- `/about`
- `/about-us`
- `/admin/analytics`
- `/admin/audit-logs`
- `/admin/blogs`
- `/admin/bundles`
- `/admin/business-leads`
- `/admin/categories`
- `/admin/collections`
- `/admin/customers`
- `/admin/intelligence`
- `/admin/notifications`
- `/admin/orders`
- `/admin`
- `/admin/products`
- `/admin/recipes`
- `/admin/subscriptions`
- `/admin/supplier-uploads`
- `/admin/suppliers`
- `/admin/users`
- `/admin-access`
- `/auth/forgot`
- `/auth/login`
- `/auth/phone`
- `/auth/register`
- `/auth/reset-password`
- `/auth/signup/customer`
- `/auth/signup`
- `/auth/signup/supplier`
- `/auth/supplier-signup`
- `/auth/verify`
- `/b2b`
- `/bags/[id]`
- `/bags`
- `/blog/[slug]`
- `/blog`
- `/categories/[slug]`
- `/categories`
- `/checkout`
- `/collections/[slug]`
- `/collections`
- `/contact`
- `/cookies`
- `/creators/[id]`
- `/creators`
- `/dashboard`
- `/dashboard/products/add`
- `/dashboard/products/brands`
- `/dashboard/products/categories`
- `/dashboard/settings/roles-and-permissions/permissions`
- `/dashboard/settings/roles-and-permissions/roles`
- `/deals`
- `/diaspora`
- `/discover`
- `/farm-to-table`
- `/for-you`
- `/help`
- `/help-us`
- `/homemade`
- `/landing`
- `/meal-kits`
- `/meals`
- `/offline`
- `/orders/[id]`
- `/orders`
- `/`
- `/privacy`
- `/products/[id]`
- `/products`
- `/profile`
- `/profile/subscriptions`
- `/recipes/[slug]`
- `/recipes`
- `/refund`
- `/search`
- `/site-map`
- `/subscriptions`
- `/terms`
- `/wishlist`
