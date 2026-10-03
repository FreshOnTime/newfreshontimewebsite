# FreshPick: produce-led editorial UI

> Current carousel, navigation and recipe scope: [Editorial market](EDITORIAL_MARKET.md). The earlier implementation notes below are historical.

Updated 2026-10-02. This supersedes the serif visual direction in `EDITORIAL_REVAMP.md`. The reference is the live [Natoora homepage](https://natoora.com/en-US/): bold uppercase sans-serif type, generous produce photography, open editorial layouts and restrained navigation. FreshPick retains its own brand, copy and credited photographs.

## Visual system

- Restore the requested ivory `#F8F7F2`, green `#2F6B45` and amber `#E6A23C`. Ivory carries the page surfaces, green identifies the brand, and amber highlights shopping actions and discounts. These are visual priorities, not a rigid pixel quota.
- Use bold system sans-serif headings and wordmarks, with readable sentence-case body copy. No new font requests or dependencies.
- Use square controls, minimal borders, generous spacing and larger photographic features. Keep mobile touch targets and focus indicators.
- Public pages inherit the shared heading system. Account, checkout and admin workflows retain their existing logic; admin headings do not inherit the public uppercase override.

## Main changes

- Homepage: photographic produce hero, two large category features, open product grid, asymmetric sourcing story, brand statement, meals and basket features, recipe photography and business banner.
- Navigation and footer: stronger wordmark, simpler uppercase links, larger newsletter heading and a large footer wordmark. Search, menu, account and bag behavior remain in place.
- Page introductions: bold editorial titles with large photography on story pages; compact photographs on category and meal browsing pages.
- Product cards: square photography, uppercase product names, amber discounts and add buttons. Product-detail add buttons and discounts use the same amber/ink pairing.
- Category photographs continue to honor admin uploads; fresh produce falls back to the existing credited market-crates photograph.

## Verification

- Production build, TypeScript and targeted ESLint checking pass.
- Existing category-image, catalogue-filter, pricing and storefront API suites pass: 16 tests across 4 suites.
- Browser verification uses local catalogue fixtures, including in-stock, discounted and sold-out cards. Fixtures are outside the repository and are not shipped.
- The responsive audit covers public story, category, catalogue, search, authentication, help, policy and guest account routes at 1440, 820, 390 and 320px. It checks HTTP responses, visible headings, image loading, horizontal overflow and uncaught browser errors.
- Interaction checks exercise mobile navigation and Escape, header search, guest add-to-bag redirect, disabled sold-out cards and intercepted newsletter success/failure responses.

No live newsletter submission, customer mutation, payment transaction, database migration or production deployment is part of this change. The earlier checkout/order verification remains historical evidence for those unchanged workflows, not a new end-to-end payment test for this UI revision.
