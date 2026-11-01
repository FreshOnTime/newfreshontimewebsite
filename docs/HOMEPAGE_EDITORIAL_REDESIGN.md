# FreshPick homepage: editorial design direction

November 2026: an original FreshPick adaptation of the editorial visual rhythm at https://natoora.com/en-GB/, **not** a Natoora visual or source-code copy.

## Why this layout
Natoora’s current homepage uses oversized typographic moments, full-width photography, editorial stories and meaningful product discovery rather than a dense conventional supermarket promotion grid. FreshPick can adopt the design principles without making Natoora’s seasonal or sourcing claims.

## Original FreshPick implementation

1. **Hero**: an ivory/cream masthead with generous editorial typography and only two primary actions. One full-width, static, mixed-grocery photograph follows. Existing licensed Unsplash image and provenance in [HOMEPAGE_HERO.md](HOMEPAGE_HERO.md). No slideshow, downloaded Natoora images, animation dependencies or false availability claims.
2. **Editorial positioning**: a short FreshPick-specific message about everyday food and local makers, linked to `/farm-to-table` and `/how-it-works`.
3. **Categories**: up to six *active* database categories; if none exist, six direct catalogue-search links with locally hosted imagery. Preserve encoded category slugs.
4. **Products**: database-backed cards, prices, availability and add-to-bag components remain unchanged; the section’s heading and rhythm are simplified.
5. **Recurring baskets**: one clear editorial feature linking to `/subscriptions`, without suggesting online cards or automatic card debiting.
6. **Stories and business**: one source/maker story and one B2B enquiry feature, with authentic pages. Journal shows at most three *published* posts.
7. **Help**: existing customer answers and SEO metadata remain intact.

## Brand distinction
FreshPick is a broader Sri Lankan food marketplace: fresh produce, dairy, bakery, pantry, ready meals and locally made foods, with business sourcing enquiries. Do not imply that every item is always available, that each product has been farm-verified or that supplier settlements are automated.

## Review before merging
- Mobile 320/375/390 px, tablet 768 px and desktop 1024/1440 px: heading wrapping, full-width image crop, nav overlap and all buttons.
- Keyboard focus/contrast; reduced-motion settings; product prices and stock unaffected.
- Product/category empty state, supplier link, order/contact/subscription routes.
- Run lint, tests and production build in GitHub Actions. Visually check the deployed preview.
