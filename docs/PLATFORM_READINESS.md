# FreshPick platform readiness

Last reviewed: 2026-10-02. This is a source review and local verification record,
not a certification of the production environment.

## Completed in this change

- Customer order history uses the API's actual IDs and exposes pagination beyond
  the first 20 orders, with stable ordering and retryable loading errors.
- Order details show payment state, discount, and recorded tracking/delivery
  information. Delivery address edits validate required fields on client and API.
- Buy again creates a reviewable bag at current API prices and stock availability.
  Partial availability is explained before navigation. Failed requests are retryable.
- Cancellation and skip actions have accessible confirmation dialogs. In-flight
  actions are locked, and failed requests retain a usable retry path.
- Customer and admin order mutations claim the current order version before
  releasing inventory. Recurring templates do not release unreserved inventory.
- Admin item changes reconcile stock quantities transactionally; released orders
  cannot be reopened with a status-only edit.
- Subscription skip/pause/resume/cancel updates claim the current subscription
  state and delivery date. Cancellation and the plan counter update share a
  transaction. These account APIs return uncached responses.
- CI separates unit/API tests from live HTTP smoke tests, starts the built app,
  and smoke checks do not create accounts.

## Remaining work before calling the platform complete

| Area | Source evidence / remaining acceptance criterion |
| --- | --- |
| Checkout pricing | `app/api/orders/route.ts` still accepts a client-supplied order discount. Product cards expose `discountPercentage`, while bag/order APIs use raw `product.price`. Implement one server-owned pricing policy across catalogue, bags, reorders, checkout, and recurring deliveries; show the same payable total before order submission. Shipping currently uses a hard-coded threshold/fee and needs the approved LKR delivery policy. |
| Order submission retries | Checkout prevents simultaneous clicks in one mounted page, but the create-order API has no persisted idempotency key. Add database-backed deduplication for uncertain network outcomes and verify repeated keys return the same receipt without reserving stock twice. |
| Admin/public API boundaries | Customer management endpoints have ownership checks. Audit every catalogue/user mutation route separately; legacy public category/registration routes are not covered by this phase's management tests. Require admin authorization for catalogue writes and prohibit caller-chosen account identifiers in legacy provisioning. |
| Admin-created orders | `app/api/admin/orders/route.ts` creates orders separately from the stock-reserving customer path. Unify or explicitly distinguish reservation policy, then test creation/edit/cancel together against PostgreSQL. |
| Recurring fulfillment | Scheduled functions and delivery services exist. Run overlapping schedule/fulfillment tests against isolated PostgreSQL, including completion counters, paused/ended subscriptions, unavailable inventory, time zones, and failures. Local mocked route tests do not prove deployed scheduling. |
| Payments and settlement | Customer checkout currently presents cash on delivery. Confirm this is the launch payment method; an online gateway needs verified callbacks, duplicate-event handling, refunds, and reconciliation before being offered. |
| Customer account journey | Verify password signup, Google signup, verification, reset, refresh/logout, saved addresses, and bans in an isolated staging environment with real email/Firebase integrations. |
| Content and commerce entry points | Verify recipes, collections, wishlist, producer pages, B2B forms, and discovery surfaces using representative persisted staging data. Avoid placeholder content and claims of live functionality without evidence. |
| Deployment and operations | Validate the actual Netlify deployment, TLS/domain configuration, migrations, durable image uploads, email delivery, scheduled-function logs, backups, and alerting. The repository also has Vercel deployment jobs; align the delivery pipeline with the intended hosting platform. |

## Verification scope

Tests in this phase exercise order/subscription management routes with mocked
Prisma and authenticated identities. Browser checks use local sample orders,
subscriptions, and response fixtures. They do not modify production customers,
orders, inventory, or subscriptions. Run isolated database integration tests and
staging acceptance checks before production promotion.

Local checks passed: production build, TypeScript, 91 unit/API tests in 12
suites, and 6 HTTP smoke tests. ESLint reported zero errors and 55 pre-existing
warnings. Browser checks passed on 1440, 1024, 820, 390, and 320 px viewports
for order history, order details, and subscriptions, plus retries, confirmations,
address validation, full/partial reorder navigation, and guest return paths.

Useful commands:

```sh
npm run test:unit -- --runInBand
npx tsc --noEmit
npm run lint
npm run build
# With the application running at localhost:3000:
npm run test:smoke -- --runInBand
```
