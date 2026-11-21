# FreshPick grocery-box subscription homepage hero

The homepage hero introduces FreshPick's **existing grocery box subscriptions** first. It uses original, locally hosted grocery-box campaign artwork depicting a mixed assortment of packaged pantry essentials, dairy, eggs, bread, fruit and vegetables, full-bleed photography treatment, centered live typography, and a clear link to the actual subscription-plan listing.

## Image and provenance

- Asset: `/images/home/freshpick-grocery-box.webp` (WebP).
- Original FreshPick AI-generated editorial campaign artwork, created November 21, 2026.
- Generation and ownership/source notes: [CREDITS.md](../public/images/home/CREDITS.md).
- No reference-site photography, text or branding is copied, embedded or hotlinked.
- Illustration is **not** a real product photo, promise of specific items, or evidence of currently available stock.

## Design

- Full-bleed mixed grocery box with a dark, restrained scrim to keep text legible on all crops.
- Small eyebrow: “FreshPick · Recurring grocery boxes”.
- Headline: “The FreshPick Box.”
- Supporting text: “Fresh food and everyday groceries for your routine. Explore our available grocery boxes and choose a delivery schedule that works for you.”
- Primary action: **Explore subscription boxes** (real route: `/subscriptions`).
- Secondary action: **Shop the market** (`/products`).
- Heading and controls remain semantic HTML over a `next/image` layer, never baked into the artwork.
- Responsive centered layout; mobile uses a grocery-box-focused crop with a stronger legibility scrim. Fixed minimum heights avoid layout shifts.
- Static hero avoids carousel JavaScript, autoplay, timer controls and related performance costs.

## Subscription behavior and truthfulness

The homepage hero is **merchandising, not a checkout form**. The `/subscriptions` page loads active plans from the database, shows plan details and starts the existing authenticated subscription/checkout process. When no active plans exist, it shows the site's existing truthful empty state and product/contact alternatives.

The hero does **not** claim a fixed box price, guaranteed selection, shipping timeframe, automatically charged card, or active availability of a particular plan. See [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md) for actual cadence and fulfilment behavior.

## Release checks

1. Test at 320, 375, 390, 768, 1024 and 1440px: crop, headline wrapping, contrast and nav overlap.
2. Check both actions by keyboard and pointer, including focus visibility.
3. Validate `/subscriptions` for available plans and for the no-active-plan state.
4. Check that the artwork loads locally in production and the hero is visible before any JS hydration.
5. Run lint, the targeted homepage UI test, and the build before merging.
