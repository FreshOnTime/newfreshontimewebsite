# FreshPick platform readiness

Last reviewed: 2026-10-03. This is a source review and local verification record,
not a certification of the production environment.

## Completed foundations

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

## Checkout integrity completed in this phase

- Catalogue cards, product details, MCP product results, bags, reorders, and
  customer checkout share rounded sale-unit arithmetic. Saved bags show current
  prices; historical order receipts keep their recorded prices.
- The authenticated quote endpoint resolves product aliases, merges duplicate
  references, validates whole quantities and available stock, and calculates the
  payable total. Checkout displays the item subtotal and delivery charge before
  submission. Stale prices or stock changes stop placement for review.
- The order API rejects client-issued order discounts, invalid delivery addresses,
  unsupported payment methods, and references to another customer's bag.
- Checkout sends an `Idempotency-Key`. A customer-scoped database key is claimed
  before reservation, and its receipt is committed in the same transaction. A
  repeated intent replays the receipt; a changed intent using the same key gets
  a conflict. Keys are optional for compatibility with existing API consumers;
  those consumers must send keys to get duplicate protection.
- The browser keeps only an opaque intent hash, retry key and schedule timestamp
  in session storage. It recovers a committed receipt after reload even if the
  order has consumed all available stock. When storage is disabled, retries in
  the same mounted page remain protected; reload recovery is unavailable.
- Future recurring orders use current catalogue prices and delivery charges,
  start with payment pending, and reserve every item before creation. Unavailable
  inventory rolls back the due-date claim so a later run can retry.
- Legacy category and brand writes require a verified admin. Product-add delegates
  to the validated admin route. Passwordless, caller-ID account provisioning is
  replaced by the existing validated, rate-limited signup flow. Public product
  detail reads exclude archived products; archived items can still be removed
  from a saved bag.
- CI runs checkout transaction verification in a separate PostgreSQL schema.

### Migration and integration verification

Apply `npm run db:migrate` before deploying this code. Do not remove completed
retry receipts without an explicit retention policy: removing a key permits an
old client retry to create another order. Subscription signup now has its own durable retry receipts. Online payments
remain a separate integration.

The reproducible database check refuses remote hosts and requires a fresh,
empty `checkout_test_*` schema. It creates local fixture users, products and
orders. Example for a disposable local PostgreSQL instance:

```sh
export CHECKOUT_TEST_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/freshpick_test?schema=checkout_test_manual'
DATABASE_URL="$CHECKOUT_TEST_DATABASE_URL" npx prisma migrate deploy
npm run test:checkout-db
```

## Account and design continuation

The [account design and flow fixes](ACCOUNT_DESIGN_AND_FLOW_FIXES.md) add softer shared surfaces, separate account photographs, safe return destinations, supplier save retries and ownership enforcement, first-bag item creation, password-reset validation and atomic token consumption. [Public discovery improvements](DISCOVERY_IMPROVEMENTS.md) cover canonical URLs, sitemap entries, journal HTML and help answers. These locally verified changes retain the staging and operational acceptance criteria below.

## Operational gaps addressed

The [operating guide](OPERATIONS.md) covers the additive migration, configuration,
new admin workflows and deployment acceptance. This phase implements protected
admin promotion/uploads, stock-reserving admin order creation, persistent subscription
retry receipts, atomic plan capacity checks, a basket delivery queue and delivered
counter claims, supplier application review, newsletter management and signed
unsubscribe, durable image storage, configured delivery pricing/areas and a leased,
retrying email outbox. Netlify builds now retain type checking, and CI no longer
contains competing Vercel deployment jobs. Secondary admin roles work in the admin
layout and the shared admin API guards.

## Remaining production acceptance

| Area | Required acceptance |
| --- | --- |
| Configuration | Set approved delivery fees/threshold/areas, canonical site URL, Azure and verified SendGrid credentials; run the read-only preflight. No real business rates were supplied. |
| Database | Back up and restore-test, apply the additive migration, verify the PostgreSQL concurrency script and reconcile historical unreserved orders. |
| Basket fulfillment | Optional catalogue mapping now reserves stock and creates linked COD orders. Review real stock-unit mappings and delivery-inclusive plan pricing before opt-in; exercise shortages/retry, packing, collection, pause/skip/cancel and deployed scheduling in staging. Existing plans remain manual. |
| Hosting and monitoring | Verify the linked Netlify site/domain, published function schedules, provider activity, logs, backlog alerts and backup policy. Code changes do not configure external dashboards. |
| Payments | Checkout offers cash on delivery. A gateway, callback idempotency, refunds and settlement need a separate integration before online payment is offered. |
| Account integrations | Exercise signup, verification, password reset, refresh/logout, Google/Firebase, saved addresses and bans using staging credentials. |
| Catalogue and content | Verify representative persisted blog stories, product collections, wishlist, producer and B2B records; remove placeholders. Review old supplier approvals and existing inline image references explicitly. |
| Permission review | The reported exposed routes and supplier ownership fallback are fixed; this is not a certification of every legacy API. Continue the wider permission/validation review separately. |

## Verification scope

This phase passes 256 unit/API tests across 34 suites, TypeScript checking and the
production build. Lint has no errors and retains existing warnings. A built-app
browser check exercised supplier review, delivery confirmation/completion, newsletter
pagination/deactivation and signed unsubscribe through actual routes with local
Prisma fixtures, at 320, 390, 820 and 1440 px; no overflow or browser exceptions.
[GitHub CI run 37099034036](https://github.com/FreshOnTime/newfreshontimewebsite/actions/runs/37099034036)
passed database migrations and the expanded integrity script against isolated
PostgreSQL 16, including concurrent basket signup/capacity, single delivery counting,
and newsletter signup/outbox/link invalidation. CI also passed tests, build and HTTP
smoke checks. External credentials, production database contents, email delivery,
uploads and Netlify schedules have not been exercised against production.

## Basket inventory continuation

The additive `20261003070000_basket_inventory` migration supports opt-in catalogue
mapping, stock-reserving COD orders, blocked fulfillment recovery and synchronized
order/delivery lifecycle. Plan content edits now persist with optimistic version
checks, including content-only edits; historical subscription plans cannot be
hard-deleted. See [the operating guide](OPERATIONS.md) for activation and pricing.

Local validation covers 267 unit/API tests, type checking and a production build.
The isolated PostgreSQL integrity script additionally covers mapped basket shortage
rollback, concurrent retry, fixed-price rounding, durable confirmation, cancellation,
order/queue completion races, consumed-stock refunds and stale plan content edits.
Production inventory mappings, COD collection and deployed scheduling still need
staging acceptance with real business configuration.
