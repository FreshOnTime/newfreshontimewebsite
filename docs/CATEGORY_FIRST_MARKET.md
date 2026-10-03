# Category-first market and producer content

> Current carousel, navigation and recipe scope: [Editorial market](EDITORIAL_MARKET.md). The earlier implementation notes below are historical.

Updated 2026-10-03, following the merged account-design work.

## Shopping hierarchy

The homepage now contains the approved market banner, six category tiles, current products, a compact FreshPick introduction, the journal and ordering help. The primary banner action scrolls to the category grid. Active catalogue categories supply the tiles; Fresh produce is placed first and the remaining admin order is retained. An unavailable catalogue uses six grocery-search links rather than invented category routes.

Separate ready-meal, recurring-basket, recipe, creator and large business campaigns were removed from the homepage. Their existing routes remain available. Homemade/local-maker links were removed from the primary header and footer; food types are explained together on Our Producers. This simplifies the main journey without deleting published content or breaking older links.

Desktop and mobile navigation prioritize Categories, Shop all and Weekly baskets, followed by Our Producers and About. Journal, recipes, business, supplier applications and help remain in More or the mobile menu. A heart links directly to Saved products; its count uses the existing WishlistContext and reflects the signed-in account. Guests can sign in from the wishlist with a return destination.

## Weekly baskets

This is an implemented feature, not a new placeholder: `/subscriptions` loads active plans, plan links lead to `/checkout?plan=...`, checkout creates subscriptions, `/profile/subscriptions` manages them, and the recurring processor creates due deliveries. It therefore remains in the footer and has a direct desktop/mobile navbar link. No-active-plans behavior remains explicit. The Choose plan CTA is a single accessible link instead of a button nested in a link.

The navigation change does not activate plans or configure the production scheduler. Real plan contents, delivery arrangements and operational acceptance still require approval and verification as tracked in [platform readiness](PLATFORM_READINESS.md).

## Story, producers and branding

About now explains household needs, everyday essentials, busy-day food, sharing food, category shopping, saved products, ordering choices and how local businesses can apply. It includes five image panels. Our Producers welcomes applications from home growers, produce suppliers, homemade food businesses, bakeries, beverage makers and pantry suppliers, with six illustrative product panels and three practical onboarding steps.

Supplier calls to action lead directly to `/auth/signup/supplier`, rather than the generic business enquiry page. The existing supplier form gives relevant product examples and asks for quantities and lead time in the catalogue note. Applications are described as reviewed; the page does not invent named suppliers, guarantee automatic listing or claim all illustrated products are currently available.

The shared Wordmark uses Fresh in `#2F6B45` and Pick in the warm orange-brown `#A45F23`, on light surfaces. It appears in the navbar, public footer, account/checkout footer, About and the admin sidebar. The grocery palette and amber `#E6A23C` purchase/action treatment remain. The footer now uses a paper background with readable green/clay branding and matching newsletter controls; the oversized repeated footer wordmark was removed.

## Assets

Generated with the built-in image-generation tool and encoded as WebP. These are editorial illustrations of food and growing environments, not documentary photographs of actual FreshPick suppliers.

| Asset | Dimensions | Use |
| --- | --- | --- |
| `public/images/about/everyday-kitchen.webp` | 1536 × 1024 | About lead image and compact homepage story |
| `public/images/producers/home-garden.webp` | 1536 × 1024 | Home growers, producer lead and About producer section |

Existing local category photography is reused for cooked food, pantry, bakery and beverages.

## Verification

Production build, TypeScript and ESLint for the changed/new TS/TSX files pass. All 188 unit/API tests pass across 25 suites.

42 fully rendered responsive checks pass across seven routes at 1440, 1280, 1024, 820, 390 and 320px. They check loaded images, page content, the shared wordmark colors, saved-products access, the mobile menu and horizontal overflow. Desktop and mobile previews were visually inspected.

Six interactive flows pass: the homepage category anchor and category selection; the desktop More menu to Journal; guest wishlist sign-in return; mobile weekly-basket selection and sign-in return to plan checkout; the signed-in wishlist count and populated page; and the producer application link with relevant product guidance. No browser page errors were observed.

Browser checks use controlled local catalogue/account fixtures; they do not alter production products, plans, applications or orders. Preview screenshots show local sample categories/journal entries and the homepage's empty-product state. These checks do not certify real supplier approval, scheduler execution or production fulfillment.

## Final image prompts

**Household kitchen:** Use case: photorealistic-natural. Asset type: landscape editorial About FreshPick website photograph, 3:2 ratio. Primary request: a believable everyday Sri Lankan household kitchen table laid out for cooking. Subject: a loosely filled canvas shopping bag beside aubergines, carrots, leafy greens, limes, ripe papaya and bananas, a simple bowl of uncooked rice and a cutting board; two naturally sized ceramic plates and a folded linen cloth. Pale warm stone counter, ordinary tidy kitchen softly out of focus. Natural morning window light, rich natural textures and slight grain, premium food magazine photography, cream background, leafy green and terracotta accents. Camera at table height with a slightly elevated view, quiet generous composition with space around food, no people. Not an advertisement collage. No writing, packaging labels, logos, watermarks, unrealistic food, symmetrical layout, neon colors or gloss. This is illustrative brand photography, no portrayal of a named supplier.

**Home garden:** Use case: photorealistic-natural. Asset type: landscape photograph for FreshPick's Our Producers page, 3:2 ratio. Primary request: an intimate home vegetable garden in Sri Lanka, showing that small growers can supply useful everyday ingredients. Subject: raised growing beds and modest terracotta pots with healthy leafy greens, brinjal plants with a few naturally sized purple aubergines and green chillies. A low woven harvest basket with a small, freshly cut bunch of greens rests beside the beds on a narrow garden path. Tropical foliage softly blurred behind, realistic home garden rather than a vast plantation. Gentle morning daylight, tactile soil and imperfect leaves, naturally deep greens, warm cream and earthy clay tones. Premium documentary food-magazine photography, camera at garden level, inviting and simple. No people, no text, no logos, no watermarks, no futuristic greenhouse, no excessive vegetables, no floating objects, no illustration or collage. Illustrative brand scene, not a photograph of a named FreshPick supplier.
