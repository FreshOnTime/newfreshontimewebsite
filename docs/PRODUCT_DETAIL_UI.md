# Product detail usability and catalogue data checks

## Product photos

The product page uses the real product's `image` field or first `images` entry from the database. If neither is available, or if a supplied link fails to load, the storefront shows a small, explicit **Photo coming soon** fallback instead of enlarging the generic cutlery SVG.

**This is a graceful UI fallback, not a replacement product photograph.** To resolve missing photos, an authorized store administrator must open `/admin/products`, locate the SKU, upload a suitable product photo, save, and confirm that its public URL loads from the deployed site. The production upload API requires configured Supabase image storage; local files are only a development fallback.

A URL outside the Next.js image optimizer's configured origins is rendered unoptimized, and load failures still fall back. Check browser image requests, Supabase object permissions and the stored database URL if a newly uploaded image is unavailable.

## Quantity and bag controls

- The product image is now square; responsive cropping and a smaller fallback avoid a very tall empty panel.
- Quantity stepper buttons stay usable at a fixed 44px width; the field receives the remaining width.
- The control row stacks on small screens and uses a 190px quantity column on larger widths.
- While signed out, the primary action is **Sign in to add to bag**; the bag-switching dropdown is hidden until authentication.
- Signed-in customers retain the existing bag creation and selection flows.
- The action rejects non-integer, zero, negative or excessively large quantities before API submission. Actual checkout validation still runs on the server.
- Product amount and selected quantity totals continue to use the existing pricing and bag calculation functions.

## Price discrepancies and safe correction

The displayed product price is sourced directly from `Product.price` (PostgreSQL, LKR), with the saved discount applied. A screenshot showing **Fresh Banana**, **SKU12345**, **Rs. 2.50** indicates a catalogue value that needs an administrator check; it cannot be safely changed to a guessed price in source code. Review the SKU in `/admin/products` and confirm the intended price, sale unit, promotion and stock before updating production.

If a product includes custom `unitOptions`, note that the current bag API persists the product ID and integer quantity rather than a selected variant price. Review these options separately before marketing them as independently priced selectable variants.

## Validation before merge

1. Desktop and mobile: visit a product with a valid photo, one with a missing photo and one with a bad URL.
2. At 320px, 375px, 768px and 1024px check that the quantity controls and primary button do not overlap or overflow.
3. Test signed-out sign-in redirect, signed-in bag selection, create-new-bag and add flows.
4. Test out-of-stock button, invalid quantity, min/max boundaries and totals.
5. Confirm that a real saved product image appears after cache revalidation (up to five minutes).
6. Run the targeted UI tests, lint and full production build.
