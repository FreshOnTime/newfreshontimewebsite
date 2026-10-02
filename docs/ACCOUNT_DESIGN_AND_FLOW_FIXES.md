# Account design and flow fixes

Reviewed 2026-10-03. This update builds on the merged public-discovery changes and keeps the FreshPick cream, green and amber palette and approved market banner.

## Design

The shared radius is now 12px rather than zero. Small and medium controls have positive 8px/10px radii, cards and photo surfaces use 16px, and major image panels use 20px. Tables, dividers, page backgrounds and joined button seams retain their structural layout.

Sign-in and sign-up use separate local photographs with leafy greens, tropical fruit and everyday market ingredients. Account panels show a compact crop on mobile and a larger photograph with a green caption on desktop. Forms have less inset padding, mixed-case headings, password visibility controls, autocomplete hints and readable validation alerts. Customer and supplier account-choice cards now use consistent heading sizes.

The homepage banner, category and product photographs, journal/story cards, newsletter fields, product actions, dialogs and shared cards use the softer radius system. Existing imagery and the approved home banner remain in place.

## Bugs corrected

- Login return URLs are checked as local URLs; protocol-relative URLs, backslashes, control characters and account-page loops are rejected. The account-choice and customer-signup links carry the valid destination through to completion.
- Sign-in trims the identifier and clears a previous login error when reopening the form. Password fields have explicit browser autocomplete hints.
- Customer and supplier forms use the server's signup validation before sending the request, with the password rules visible on the page.
- Signup no longer logs the request body, which contained the plaintext password. Malformed JSON returns 400; concurrent uniqueness conflicts return 409 rather than a generic server failure.
- Supplier registration requires a signed-in account. Creating a supplier and linking the account share a transaction. A retry uses only the account's own supplier link; matching submitted contact details never grants ownership of another supplier. Upload no longer performs this unsafe contact-based auto-link.
- Supplier applications check the HTTP result, show save failures and retry just the application after the login account has been created. Existing signed-in customers can apply using their account. The product catalogue note is saved in supplier notes instead of being dropped.
- Creating the first bag from a product page includes the selected item in the same create request. The existing bag API validates stock and prices the item on the server. Creating an empty bag from the bag menu retains that behavior.
- Password reset validates the same password rules as signup. Token consumption, password update and refresh-session revocation share a transaction; a concurrent reset cannot reuse a consumed token. Already-issued access tokens still expire according to the existing JWT policy.
- Firebase client configuration now honors the public environment variables listed in `.env.example`, retaining the existing project defaults for compatibility.
- The README now uses PostgreSQL configuration and migration steps and does not label unverified repository features as live production capabilities.

## Verification

Recorded local results:

- Production build, TypeScript and ESLint for changed/new TS/TSX files pass.
- 188 unit/API tests pass across 25 suites; six HTTP smoke checks pass against the running local application.
- 60 responsive checks pass: 12 routes at 1440, 1024, 820, 390 and 320px, with loaded account images, meaningful page content and no horizontal overflow.
- Five interactive flows pass: login errors and return navigation; customer validation and signup return; supplier failure/retry; an existing customer's supplier application; and first-bag item creation in one request.
- No browser page errors were observed. Desktop/mobile account previews were inspected.

Database and response fixtures isolate the local checks from production customer data. Browser account responses are controlled to exercise failure and retry behavior. Unit/API tests cover authorization, duplicate-contact refusal, transaction branches, input validation and reset-token consumption. They do not replace a database concurrency check or real Firebase/email acceptance tests.

The production launch criteria still live in [platform readiness](PLATFORM_READINESS.md), including approved delivery charges, online payment decisions, scheduled fulfillment, actual hosting configuration, backups and real email/Firebase flows. This update does not claim that the entire platform is production-certified.

## Image assets

Generated using the built-in image-generation tool; encoded as WebP for the application. These are editorial brand assets, not photographs of actual suppliers or fulfillment operations.

| Use | Repository asset | Size |
| --- | --- | --- |
| Sign-in and recovery | `public/images/auth/market-still-life.webp` | 1024 × 1536 |
| Signup and supplier application | `public/images/auth/market-bag.webp` | 1024 × 1536 |

Final prompts:

**Sign-in:** Use case: photorealistic-natural. Asset type: tall portrait photograph for the sign-in panel of FreshPick, a premium grocery market in Colombo. Produce a single editorial food photograph, portrait 2:3 composition. A loosely gathered bunch of leafy greens, small aubergines, fresh green limes, a few golden passion fruits, green chillies and a cut papaya on an aged pale limestone kitchen counter beside casually folded natural linen. Natural window light from the left, beautiful real shadows, warm creamy paper-like tones with deep leafy green accents, subtle grain, tactile textures and natural imperfections. Photograph from a slightly elevated side angle, quiet and expensive culinary magazine feel. Food clustered in the lower middle with a little breathing room above, all principal produce visible in a central crop. No people, no hands, no text, no labels, no logos, no borders, no floating items, no glossy plastic vegetables, no symmetrical decorative collage.

**Sign-up:** Use case: photorealistic-natural. Asset type: tall portrait photograph for the sign-up panel of FreshPick, a premium grocery market in Colombo. Produce a single editorial still-life photograph, portrait 2:3 composition. A casually open natural canvas market bag on a pale stone kitchen table, with fresh leafy greens and carrots peeking out, ripe mangoes, aubergines and a small bunch of bananas arranged loosely beside it. One simple terracotta bowl holding limes, soft creased linen partly under the bag. Warm early morning window light, genuine gentle shadows, subtle film grain, premium culinary magazine photography, tactile organic materials and natural imperfections. Cream, leafy green and muted golden accents; realistic ordinary edible produce. Quiet unposed composition with all main subjects in the central crop. No text, no labels, no logos, no people, no hands, no fake packaging, no floating products, no surreal fruit, no symmetrical collage, no borders.
