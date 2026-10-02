# FreshPick platform readiness

Last reviewed: 2026-10-02. This is a source review and local verification record,
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
old client retry to create another order. Online payments and subscription-plan
creation do not gain idempotency from this customer-order migration.

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

## Remaining work before calling the platform complete

| Area | Source evidence / remaining acceptance criterion |
| --- | --- |
| Delivery pricing | The shared policy preserves the previous Rs. 5 delivery charge at subtotal ≤ Rs. 50 and free delivery above Rs. 50. Obtain and implement the approved LKR fee/threshold, service areas, and tax policy before launch. Catalogue percentage promotions are supported; verified order-level promotions remain to be implemented. |
| Subscription creation retries | Customer product-order retries are persisted and verified. Subscription-plan creation still uses its separate API and needs equivalent protection for uncertain network outcomes. |
| Admin/public API boundaries | Legacy category/brand writes, product-add and registration are now covered. Complete a separate permission and validation audit of every remaining catalogue/user/admin mutation, including secondary roles. |
| Existing inventory records | Reconcile any pending recurring orders created by older code without reservations. The new transaction behavior does not repair historical inventory discrepancies. |
| Admin-created orders | `app/api/admin/orders/route.ts` creates orders separately from the stock-reserving customer path. Unify or explicitly distinguish reservation policy, then test creation/edit/cancel together against PostgreSQL. |
| Recurring fulfillment | Scheduled functions and delivery services exist. Overlapping recurring-order claims, current pricing, and unavailable-stock rollback passed isolated PostgreSQL checks. Subscription fulfillment counters, paused/ended subscriptions, time zones, failure notifications, and deployed scheduling still need staging acceptance tests. |
| Payments and settlement | Customer checkout currently presents cash on delivery. Confirm this is the launch payment method; an online gateway needs verified callbacks, duplicate-event handling, refunds, and reconciliation before being offered. |
| Customer account journey | Verify password signup, Google signup, verification, reset, refresh/logout, saved addresses, and bans in an isolated staging environment with real email/Firebase integrations. |
| Content and commerce entry points | Verify recipes, collections, wishlist, producer pages, B2B forms, and discovery surfaces using representative persisted staging data. Avoid placeholder content and claims of live functionality without evidence. |
| Deployment and operations | Validate the actual Netlify deployment, TLS/domain configuration, migrations, durable image uploads, email delivery, scheduled-function logs, backups, and alerting. The repository also has Vercel deployment jobs; align the delivery pipeline with the intended hosting platform. |

## Verification scope

Local verification includes 132 unit/API tests in 17 suites, a production
build, TypeScript, and six non-mutating HTTP smoke checks. ESLint reported zero
errors and 55 existing warnings.

Isolated PostgreSQL checks applied every migration to a fresh schema and verified
concurrent same-key receipt replay, one reservation per order, conflicting
intents, customer scoping, competing checkout stock protection, stale quotes,
transaction-time price-change rollback, unavailable recurring inventory rollback,
and overlapping recurring schedule runs. These checks use disposable fixtures;
no production customers, orders, stock, or subscriptions were modified.

Browser verification uses local response fixtures at 1440, 1024, 820, 390 and
320 px. It covers quoted prices and delivery totals, quote failures and retries,
uncertain submission retries, receipt recovery after reload, discounted quick
orders, recurring retry payloads, and separate subscription-plan checkout.
These checks do not verify production email, payment settlement, or scheduled
function operation.

Useful commands:

```sh
npm run test:unit -- --runInBand
npx tsc --noEmit
npm run lint
npm run build
# With the application running at localhost:3000:
npm run test:smoke -- --runInBand
```
