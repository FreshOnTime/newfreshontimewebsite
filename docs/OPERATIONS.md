# FreshPick operating guide

Production configuration, database backups and staging acceptance remain operator
actions. Netlify's production build now applies committed migrations before building
the application; previews check migration status without changing a shared database.

## Deploy in this order

1. Back up PostgreSQL using the database provider's snapshot/PITR facility. Verify
   a recent restore in a separate staging database before a production migration.
2. Set the server environment values below in Netlify's Functions scope as well
   as its build scope. Use a separate database and service credentials for previews.
3. Run `npm run check:production -- --config-only` to identify missing settings.
4. Against the intended staging database, run `npm run db:migrate` and then
   `npm run check:production`. The latter only reads the migration table/database;
   it does not apply migrations, send messages or upload files.
5. Exercise staging orders, uploads, supplier review, basket deliveries and email.
   After acceptance, back up production and review the pending migrations before
   publishing the app. `npm run build:netlify` applies them with `prisma migrate deploy`
   when `NETLIFY=true` and `CONTEXT=production`, before the Next.js build. A failed
   migration stops publication instead of serving code against missing tables/columns.
   For previews/branch deploys, the command only runs `prisma migrate status`; apply
   migrations to their isolated database explicitly. Do not point previews at an
   unmigrated production database or give them a migration-on-build override.
6. Use Netlify's Git integration for previews and production publishing. GitHub
   Actions checks tests, PostgreSQL concurrency, types/build and HTTP smoke routes.
   Require the test job before merging; the removed Vercel jobs were a separate,
   conflicting deployment pipeline. Verify Netlify's actual linked branch/domain.

### Recover admin lists that fail to load

Suppliers require the application/review columns from the platform operations
migration; partnership applications require `business_leads`; Enquiry inbox requires
`contact_enquiries`. Generating a Prisma client does not create these database objects.
Check Netlify function logs for `P2021` (missing table) or `P2022` (missing column).
Authenticated admin APIs now return 503 with `DATABASE_SCHEMA_OUTDATED` for these
conditions rather than an empty queue or authentication error.

Publish through the configured Netlify build command with `DATABASE_URL` available
in both Build and Functions scopes, targeting the same intended database/schema.
If the Netlify UI overrides the repository's build command, set it to
`npm run build:netlify`. For controlled manual recovery, apply `npm run db:migrate`
against that target database, then refresh the admin lists. No public migration
endpoint is exposed. A missing build credential fails deployment with an explicit
message instead of silently skipping schema readiness.

Expired/missing access tokens return 401; authenticated non-admin/banned accounts
return 403. The affected screens refresh the session once and retry, sharing token
rotation across simultaneous requests. Database outages remain 500/503 and must not
trigger refresh. An expired refresh session still requires signing in again.

## Server configuration

| Setting | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection with the required migrations applied |
| `JWT_SECRET` | At least 32 characters; keep stable to preserve sessions and default unsubscribe signatures |
| `DELIVERY_FEE_LKR` | Required approved flat delivery fee; **no production default** |
| `DELIVERY_FREE_ABOVE_LKR` | Optional subtotal threshold; free delivery applies strictly above it; blank disables it |
| `DELIVERY_MINIMUM_LKR` | Minimum merchandise subtotal; defaults to zero |
| `DELIVERY_AREAS` | Optional comma-separated cities; blank uses the site's published `SERVICE_AREAS`; match customer-facing delivery copy |
| `FRONTEND_URL` | HTTPS canonical site origin for email links |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | SendGrid key and verified sender |
| `NEWSLETTER_TOKEN_SECRET` | Optional separate 32+ character key; otherwise uses `JWT_SECRET` |
| `AZURE_STORAGE_CONNECTION_STRING` | Durable product-photo storage; `product-images` container must permit public image reads or have a compatible public CDN |

Test-only delivery fixtures remain Rs. 5/Rs. 50. They are not proposed business
rates. Tax remains zero; obtain a business decision before changing tax behavior.
Missing approved delivery pricing returns an explicit 503 at quote/placement.
Unsupported countries/cities are rejected before an order or subscription is saved.

The image API accepts authenticated admins, inventory managers and approved,
active suppliers. It bounds streamed multipart bodies, limits images to 4 MB,
checks JPEG/PNG/WebP/AVIF headers and gives each upload a random filename. Netlify
and production require Azure; local disk is only a development fallback. Existing
inline `data:` image records are not converted automatically: re-upload them through
the protected endpoint and replace their product references. Back up blob storage
and enable its retention/versioning separately from database backups.

## Admin workflows

- **Suppliers → Review applications:** approve/reject new supplier applications
  and record private review notes. New applications are pending and inactive;
  both image and catalogue uploads require approval. Existing supplier records
  retain approved state during migration for compatibility: review historical
  records explicitly. Dashboard ownership uses the account's stored supplier link,
  never a guessed email/phone match. Approval enables uploads, not automatic product
  publication. Product-import review remains its separate existing workflow.
- **Subscriptions → Basket delivery queue:** filter scheduled records, confirm
  preparation, mark delivered or cancel an individual delivery. Version checks
  reject stale edits. The delivered counter increments in the winning transaction
  and repeated completion does not increment it again. Cancelling a queued basket
  leaves the customer's future schedule active.
- **Subscriptions → Edit plan:** map each content row to an active catalogue product
  and specify whole **stock units**. Display quantities (for example “1 kg”) do not
  control inventory. Repeated product mappings combine their stock quantities.
  Enable **Reserve catalogue stock and create orders** only after reviewing the
  mapping and confirming that the advertised basket price includes delivery.
  Existing plans default to manual fulfillment; no historical delivery is converted.
- Stock-tracked scheduled baskets claim the due date, reserve every product, create
  a linked cash-on-delivery order and queue its confirmation in one transaction.
  The fixed plan price is allocated proportionally across products in exact cents;
  rounding may split a product into two price lines. Delivery is included, with no
  additional shipping charge. COD stays payment-pending until an operator records
  collection. This does not add an online payment gateway.
- Shortages, archived/missing mappings, unsupported addresses, banned accounts and
  custom customer requests block automation without advancing the schedule or
  reserving partial stock. Use **Basket delivery queue → Needs attention** to read
  the reason, fix stock/mapping/address, then **Retry fulfillment**. Concurrent
  retries create at most one delivery. An overdue stock-tracked basket creates one
  recovery delivery, then advances to a future slot; it does not bill missed weeks. Customer exclusions/preferences require an
  operator; use a manual plan when substitutions are necessary. The worker rotates
  failed attempts behind new due subscriptions so one shortage cannot starve others.
- Linked basket orders appear in the existing order dashboard and customer order
  history. Status/address updates synchronize the queue. Cancel before shipment to
  release inventory once; delivered refunds keep the delivery count and do not add
  consumed stock back. Queue completion and order completion count once together.
  Contents/prices are locked for existing basket orders; edit the plan for future
  deliveries. Basket orders and subscribed plan history cannot be hard-deleted.
  Cancelling a subscription stops future scheduling; cancel any already queued
  order separately. Apply the additive basket inventory migration before deploying.
- **Publishing → Newsletter:** search and page subscribers; unsubscribe an address.
  Admins cannot reactivate an address. Customer signup is the reactivation path.
  Signed unsubscribe links display a confirmation page; only POST changes state.
  A later signup invalidates links from the earlier signup generation. Active
  duplicate signups return the same generic success and enqueue no extra welcome.
- `/api/admin/operations/health` is an authenticated, uncached readiness summary:
  configuration booleans, queued/failed email and overdue active schedules. No
  credentials or message bodies are returned. Investigate any failed/overdue counts.
- Admin promotion requires an existing verified admin and emits an audit record.
  Bootstrap the first administrator using a controlled database/provider procedure;
  the public API cannot bootstrap itself.

## Scheduled work and email

`process-recurring-orders` runs every 15 minutes; `process-email-outbox` runs every
minute. Scheduled functions use UTC, have a 30-second limit and run automatically
only on published Netlify deploys. Use **Run now** in the Netlify Functions UI for a
staging preview. They cannot be invoked by a public production URL. See the
[Netlify scheduled-functions documentation](https://docs.netlify.com/build/functions/scheduled-functions/).

Both services process bounded batches and stop starting new work after their
20-second budget. Mail processes at most two messages per invocation with an
8-second provider timeout. Monitor backlog; higher traffic needs a larger queue
worker architecture rather than raising the scheduled-function limit. Slow database
operations can still exceed the platform deadline; transactional claims/leases make
an interrupted invocation recoverable.

Email is persisted before the request ends. Customer/recurring order confirmations
are enqueued in the same transaction as the order. Newsletter signup and its welcome
queue entry also share a transaction. Other notifications await persistence and log
queue failures; external delivery is handled by the scheduled worker. Signup account
creation remains successful if the optional verification notification fails; monitor
logs and provide support for a replacement verification link.

Mail retries up to six attempts with backoff. A worker claims a five-minute lease;
expired claims can be retried. Delivery is **at least once**: a provider success
followed by a database/network interruption can cause a duplicate message. Sent
bodies are cleared. Terminal records are removed after 30 days; pending records
remain until processed. Queued newsletters are suppressed after unsubscribe or a
new signup generation. Auth tokens in pending mail bodies are sensitive: restrict
DB access and never copy them into logs or tickets.

Use SendGrid's verified-domain setup and provider activity logs to confirm delivery.
This branch does not configure DNS, provider credentials or a marketing campaign
sender. Future campaign emails must use the same signed unsubscribe mechanism and
check active consent at send time. The feature currently manages signups and welcome
emails, not bulk campaigns.

## Acceptance and monitoring

Use representative staging data to verify:

- normal/admin order create/edit/cancel inventory, current prices and retry receipts;
- capacity-limited basket signups under concurrent requests, pause expiry, skip,
  cancellation, plan disable/enable, schedule replay and delivered-count retries;
- pending/approved/rejected supplier uploads and ownership boundaries;
- welcome/unsubscribe/resubscribe, verification and reset mail using the real sender;
- upload persistence after a cold start, public image loading and no `data:` results.

Set alerts in the hosting/database/provider dashboards for function errors, growing
mail backlog, failed mail and active schedules over one hour overdue. Verify a
provider outage and later recovery in staging. Check HTTPS/domain/canonical URLs,
Firebase credentials and actual Google login separately. The code cannot prove those
external accounts are configured. Schedule managed backups and periodically restore
into an isolated database; store backup access separately from app credentials.

Do not delete checkout/subscription retry receipts casually: deletion permits old
retries to create new records. Reconcile historical orders made before inventory
reservations were fixed. The migration does not correct historical stock.

## Disposable PostgreSQL verification

The integration script refuses remote hosts and requires a fresh `checkout_test_*`
schema. It creates fixtures, not production accounts. It checks product checkout
stock/receipt races, recurring order races, basket capacity and delivery completion,
and concurrent newsletter signup with atomic queued mail and stale unsubscribe links.

```sh
export CHECKOUT_TEST_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/freshpick_test?schema=checkout_test_manual'
DATABASE_URL="$CHECKOUT_TEST_DATABASE_URL" npx prisma migrate deploy
npm run test:checkout-db
```

The script explicitly sets test pricing and a test signing secret. Do not use that
secret or those rates in production.

### Notification read migration

Deploy `20261003180000_notification_reads` before using the notification inbox. Netlify production migration-on-build applies it; `check:production` also checks its recorded completion. The additive table stores per-recipient receipts with cascading foreign keys and a unique notification/user pair. Targeted historical `isRead=true` values are backfilled. Shared broadcast read flags cannot identify a user, so broadcasts begin unread per account. No notification content is removed. Older application versions can keep using the retained column during rollback.

The disposable PostgreSQL checkout harness now also verifies notification retry/audit deduplication, concurrent reads and broadcast isolation between accounts. It never uses the production database URL.
