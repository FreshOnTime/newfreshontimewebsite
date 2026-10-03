# API reference

This reference covers the App Router handlers at the revision in the [documentation index](README.md). The inventory below includes **113 route files and 190 exported HTTP handlers**, including compatibility aliases, disabled endpoints and MCP methods that intentionally return 405. Presence in the inventory is not an endorsement to use every legacy route.

## Conventions

- Default base is the website origin; `/api` is served by Next.js. The optional `NEXT_PUBLIC_API_URL` changes the client's base when a separate backend is configured.
- JSON requests use `Content-Type: application/json`; image/spreadsheet uploads use their handler's multipart contract.
- First-party browser requests use the session cookies set by auth routes. Do not copy tokens into documentation or accept a submitted user ID as authentication.
- Database IDs are opaque strings, usually UUIDs. `_id` aliases appear for compatibility. Public SKU/slug lookups are supported only where the route resolves them.
- Money is LKR. Date responses use ISO serialization. Do not infer local calendar semantics from the storage string; basket scheduling explicitly uses Sri Lanka time.
- Response envelopes vary (`data`, `orders`, `plans`, `success`, `ok`, etc.). Consume the specific route's response; there is no universal response wrapper.
- Paginated admin lists are bounded; do not assume a `limit=1000` request returns everything.

| HTTP status | Common meaning |
| --- | --- |
| 200 | Read/update or idempotent replay |
| 201 | New entity/submission created |
| 400 | Invalid fields, unsupported action or input policy |
| 401 / 403 | Missing/invalid session or denied role/ownership; legacy guard statuses differ |
| 404 | Missing, unavailable or intentionally disabled resource; owner-private lookups may hide other users' records |
| 405 | Unsupported handler/transport method |
| 409 | Stale state/version, duplicate intent/key mismatch, capacity/stock or lifecycle conflict |
| 429 | Local rate limit; inspect retry headers where supplied |
| 500 / 503 | Unexpected failure or unavailable/configuration-dependent service; exact route determines status |

## Access policy

Modern admin routes use `requireAdminSimple` or `requireAdmin`: database-backed non-banned primary/secondary admin check. Legacy `requireAuth` routes may then check primary admin explicitly. Other routes use older wrappers or inline JWT logic. Public GET plus protected POST in one file is a mixed policy, not a publicly writable API.

The inventory's **named guard signals** are identifiers observed in each source file, not a per-method authorization certification. A dash does not mean “public”: some files use inline checks or a different middleware. Review the linked handler, method and owner/role checks before integrating any mutation. Dynamic role/permission routes and other legacy surfaces require an explicit security review before being exposed as a new integration.

## Authentication and accounts

| Endpoint | Request / function |
| --- | --- |
| `POST /api/auth/signup` | `firstName`, optional `lastName`/`email`, `phoneNumber`, `password`, required `registrationAddress` (addressLine1, optional addressLine2, city, province, postalCode, country); creates session and queues verification where possible |
| `POST /api/auth/login` | `identifier` (email/phone), `password`; sets session cookies |
| `POST /api/auth/google` | `{ idToken }`; server verifies Firebase Google identity and verified email, not a trusted raw email |
| `GET /api/auth/me` | Current safe account/session view |
| `POST /api/auth/refresh` | Rotate stored refresh token and session cookies |
| `POST /api/auth/logout` | Invalidate supplied/current refresh session and clear cookies |
| `/api/auth/forgot`, `/api/auth/reset`, `/api/auth/verify` | Token-based password recovery and email verification; use each route's body/query schema |
| `PATCH /api/profile` | Current user's allowed profile/address changes |

Signup password requires at least eight characters, lowercase, uppercase and a number. There are older register/signin/user routes in the inventory; use current client flows rather than assuming their bodies match signup/login.

## Catalog and shopping

Public catalog reads live under `/api/products`, `/api/storefront/products`, `/api/categories` and their detail variants. Active filtering, serialization and pagination vary by endpoint; storefront serializers intentionally omit some internal administration fields. Blog and collection public reads apply published/non-deleted/type predicates.

Authenticated bags and wishlist routes enforce ownership. Bag item mutations operate within an owned bag; reordering and checkout must refresh current product availability/prices. Reviews GET exposes approved public reviews/summary; POST requires an account, validates rating/comment and upserts the user's product review. Verified-purchase evidence is derived from delivered orders, not a submitted badge.

### Quote

`POST /api/orders/quote` requires authentication. Request:

```json
{
  "items": [{ "productId": "PRODUCT_UUID_OR_RESOLVABLE_SKU", "quantity": 2 }],
  "deliveryAddress": { "city": "Colombo", "country": "LK" }
}
```

Returns `{ "success": true, "quote": ... }`, with server-priced lines, totals and fingerprint, and `Cache-Control: private, no-store`. Items: 1–100 rows, whole quantity 1–10,000. Duplicate products are merged; unavailable items/insufficient stock fail. Delivery area is checked if supplied. Quote does not reserve stock.

### Ordinary order creation

`POST /api/orders`, authenticated, with optional `Idempotency-Key` (the checkout UI sends one):

```json
{
  "items": [{ "productId": "PRODUCT_UUID", "quantity": 2 }],
  "shippingAddress": {
    "name": "Test Customer", "phone": "+94770000000",
    "street": "10 Example Road", "city": "Colombo", "state": "Western",
    "zipCode": "00100", "country": "LK"
  },
  "useRegisteredAddress": false,
  "paymentMethod": "cash",
  "notes": "Test order",
  "isRecurring": false
}
```

Optional fields include bag ID/name and quote fingerprint. Registered-address use defaults true. Customer payment methods are `cash`/`cash_on_delivery`; nonzero arbitrary order discount is rejected. Recurrence creation uses the checkout recurrence schema when `isRecurring` is true, creating a template rather than reserving immediate delivery stock.

Ordinary order creation derives current prices and delivery policy, reserves stock and stores an owner-scoped receipt transactionally. Exact retries replay; changing intent under the same key conflicts. `GET /api/orders/receipt` retrieves the current user's request receipt using its `key` query parameter; use it to recover uncertain submission results. It is not `/api/checkout/receipts/[key]`.

Order detail/update/delete and compatibility PATCH are in the inventory. Their ownership/state restrictions are method-specific; do not assume a customer can apply every admin status transition.

### Administration of ordinary orders

`GET /api/admin/orders` filters page/limit (max 100), status, order-number search, `isRecurring`, schedule status, customerId/userId and sort (`created-desc`, `created-asc`, `next-asc`, `next-desc`). Response is `{ orders, pagination: { page, limit, total, pages } }`.

`POST` requires customer ID, item rows (`productId`, `sku`, `name`, `qty`, `price`, `total`), monetary fields, payment method and validated shipping address as defined in the handler schema. The server reloads catalog item prices rather than trusting line prices. Admin shipping/tax/discount are accepted subject to nonnegative and total-discount bounds; total is recomputed. Banned customers and foreign/missing bags are rejected. Direct `isRecurring: true` creation is rejected: create a normal order, then use recurring workflow.

`PUT /api/admin/orders/[id]` applies guarded item/status/address edits and inventory effects; basket-linked composition/pricing and lifecycle constraints take precedence. Deletion is destructive and disallowed for basket-linked orders. See [Admin Orders](ADMIN_GUIDE.md) for operating procedure.

## Subscriptions and recurring schedules

The complete schemas, examples and transition rules are in [Subscriptions](SUBSCRIPTIONS.md).

| Endpoint | Access | Key contract |
| --- | --- | --- |
| `GET /api/subscription-plans` | Public | Active plans |
| `POST /api/subscription-plans` | Admin | Plan schema with content and mode validation |
| `GET /api/subscription-plans/[id]` | Public | Direct UUID lookup can read an inactive plan; checkout listing still requires active plan |
| `PUT /api/subscription-plans/[id]` | Admin | Partial plan fields plus timestamp `version`; atomic content replacement |
| `DELETE /api/subscription-plans/[id]` | Admin | Reject any subscription history; deactivate instead |
| `GET /api/admin/subscription-plans` | Admin | Active/inactive plan list with mapped-product metadata |
| `GET /api/subscriptions` | Owner | Own subscriptions |
| `POST /api/subscriptions` | Owner | `planId`, deliveryAddress, deliverySlot day/timeSlot, `paymentMethod: cod`, optional startDate; idempotency supported |
| `GET /api/subscriptions/[id]` | Owner | Own record |
| `PATCH /api/subscriptions/[id]` | Owner | `action: pause/resume/skip/cancel`; optional future pauseUntil/reason where applicable |
| `GET /api/admin/subscription-deliveries` | Admin | page, status; `blocked` is derived due-error subscriptions |
| `PATCH /api/admin/subscription-deliveries/[id]` | Admin | `action: confirm/deliver/cancel`, integer `version` |
| `POST /api/admin/subscriptions/[id]/fulfill` | Admin | Retry one due subscription; 409 if no longer due/created |
| `POST /api/orders/recurring` | Owner | Existing owned `sourceOrderId`, recurrence |
| `PUT /api/orders/recurring/[id]` | Owner / primary admin exception | Allowed items, recurrence, scheduleStatus, nextDeliveryAt, address, notes; route-local schema |
| `PATCH /api/orders/recurring/[id]` | Same handler policy | Quick actions: `{ action: pause/resume/end }` |
| `/api/admin/orders/recurring` | Admin | GET templates; POST creation workflow |
| `/api/admin/orders/recurring/[id]` | Admin | GET/PUT/DELETE; PATCH actions pause/resume/end/force_next_delivery/skip_next_delivery/duplicate |
| `GET /api/admin/orders/recurring/stats` | Admin | Template stats, future schedules; not basket subscription stats |

## Content, onboarding and communication contracts

| Flow | Public/customer side | Administrator side |
| --- | --- | --- |
| Contact | `POST /api/contact`: submissionId UUID, name, email, subject, message, type/source/priority and optional order reference per schema; 201/new or 200/exact replay | `GET/PATCH /api/admin/enquiries`: q/status/source/type filters; update id/status/internalNotes/version |
| Business lead | `POST /api/b2b/leads`: business/contact requirement schema; save before optional mail | `GET/PATCH /api/admin/business-leads`: status pipeline; no version field |
| Supplier application | `POST /api/suppliers/register`: authenticated account; companyName/contactName/phone, optional email/product list, business address; not automatic approval | `GET/PATCH /api/admin/supplier-applications`: id, version from reviewVersion, status, notes |
| Inventory spreadsheet | `/api/suppliers/upload`: authenticated approved/active supplier and supported file | Admin preview/download/resolve/backfill/import/delete routes; import body includes uploadId |
| Product photo | `POST /api/upload/images/products`: authorized admin/inventory manager/approved active supplier; validated multipart photo | Durable production Azure storage; max 4 MB actual JPEG/PNG/WebP/AVIF |
| Blog | Public blogs list/slug | Admin GET/POST and ID GET/PUT/DELETE; draft/publish and metadata |
| Collection | Public collection list/slug | Admin GET/POST and ID GET/PATCH/DELETE; tagged content and 1–100 product IDs |
| Newsletter | `POST /api/newsletter` signup; `POST /api/newsletter/unsubscribe` signed consent mutation | GET/PATCH consent list; send `version` from unsubscribeVersion; no campaigns |
| Account messages | Authenticated recipient-only GET with page/limit/q/unread; owner-only PUT read; private no-store responses | Database-verified admin POST targets recipientId or supplierId; submissionId UUID supports exact retries; linked active producer accounts receive messages |
| Notifications | GET /api/notifications with page/limit/unread; PATCH read receipts scoped to caller | POST targeted/broadcast notification with validated local links and retry identifier; not browser push |
| Health | No public admin health access | `GET /api/admin/operations/health`: uncached readiness/queue/overdue indicators |

For example, an enquiry update uses the current integer `version`:

```json
{ "id": "ENQUIRY_UUID", "status": "in_progress", "internalNotes": "Awaiting stock confirmation.", "version": 0 }
```

The newsletter and supplier review requests also use `version`, but take it from `unsubscribeVersion` and `reviewVersion` respectively; their other required fields differ. Sources in the route inventory contain the authoritative field names and Zod limits.

## Legacy and transport exceptions

- `/api/admin/seed` exports handlers but deliberately returns 404.
- `/api/admin/customers/sync` is retained without data migration work.
- `/api/dev/send-test-email` is a development helper; inspect environment guard before use.
- `/api/referrals`: authenticated GET owns code/stats; POST attributes the signed-in customer before their first ordinary order. Admin-only PATCH requires orderId evidence of the first paid, delivered purchase and records an audited reward once. Ledger only: no automatic payout or checkout discount.
- Recurring-template deletion checks the stored version and leaves stock untouched; templates hold no reservation. Ending preserves schedule history.
- `/api/products/enhance-details`, role/permission endpoints and legacy product/user adapters are not a complete production integration contract merely because a handler exists.
- MCP POST uses JSON-RPC and stateless Streamable HTTP, not REST product writes. GET/DELETE return 405; OPTIONS handles transport policy. See [MCP](mcp.md).

## Complete route inventory

The following table is generated from actual HTTP exports. Source signals are an aid to finding code, **not** a security assertion. Each source link provides the method's full validation, response and checks.


### Administration

| Route | Exported methods | Named guard signals in file | Handler source |
| --- | --- | --- | --- |
| `/api/admin/activities` | `GET` | `requireAdminSimple` | [source](../app/api/admin/activities/route.ts) |
| `/api/admin/analytics/overview` | `GET` | `requireAdminSimple` | [source](../app/api/admin/analytics/overview/route.ts) |
| `/api/admin/blogs/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/admin/blogs/[id]/route.ts) |
| `/api/admin/blogs` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/blogs/route.ts) |
| `/api/admin/business-leads` | `GET`, `PATCH` | `requireAdminSimple` | [source](../app/api/admin/business-leads/route.ts) |
| `/api/admin/categories/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/admin/categories/[id]/route.ts) |
| `/api/admin/categories` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/categories/route.ts) |
| `/api/admin/collections/[id]` | `GET`, `PATCH`, `DELETE` | `requireAdmin` | [source](../app/api/admin/collections/[id]/route.ts) |
| `/api/admin/collections` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/collections/route.ts) |
| `/api/admin/customers/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/admin/customers/[id]/route.ts) |
| `/api/admin/customers` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/customers/route.ts) |
| `/api/admin/customers/sync` | `POST` | `requireAdminSimple` | [source](../app/api/admin/customers/sync/route.ts) |
| `/api/admin/enquiries` | `GET`, `PATCH` | `requireAdminSimple` | [source](../app/api/admin/enquiries/route.ts) |
| `/api/admin/intelligence` | `GET` | `requireAdmin` | [source](../app/api/admin/intelligence/route.ts) |
| `/api/admin/make-admin` | `POST`, `GET` | `requireAdminSimple` | [source](../app/api/admin/make-admin/route.ts) |
| `/api/admin/newsletter` | `GET`, `PATCH` | `requireAdminSimple` | [source](../app/api/admin/newsletter/route.ts) |
| `/api/admin/notifications` | `POST`, `GET` | `requireAdminSimple` / authenticated reader | [source](../app/api/admin/notifications/route.ts) |
| `/api/admin/operations/health` | `GET` | `requireAdminSimple` | [source](../app/api/admin/operations/health/route.ts) |
| `/api/admin/orders/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/admin/orders/[id]/route.ts) |
| `/api/admin/orders/recurring/[id]` | `GET`, `PUT`, `DELETE`, `PATCH` | `requireAdmin` | [source](../app/api/admin/orders/recurring/[id]/route.ts) |
| `/api/admin/orders/recurring` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/orders/recurring/route.ts) |
| `/api/admin/orders/recurring/stats` | `GET` | `requireAdminSimple` | [source](../app/api/admin/orders/recurring/stats/route.ts) |
| `/api/admin/orders` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/orders/route.ts) |
| `/api/admin/products/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/admin/products/[id]/route.ts) |
| `/api/admin/products` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/products/route.ts) |
| `/api/admin/seed` | `GET`, `POST` | — | [source](../app/api/admin/seed/route.ts) |
| `/api/admin/subscription-deliveries/[id]` | `PATCH` | `requireAdmin` | [source](../app/api/admin/subscription-deliveries/[id]/route.ts) |
| `/api/admin/subscription-deliveries` | `GET` | `requireAdminSimple` | [source](../app/api/admin/subscription-deliveries/route.ts) |
| `/api/admin/subscription-plans` | `GET` | `requireAdminSimple` | [source](../app/api/admin/subscription-plans/route.ts) |
| `/api/admin/subscriptions/[id]/fulfill` | `POST` | `requireAdmin` | [source](../app/api/admin/subscriptions/[id]/fulfill/route.ts) |
| `/api/admin/supplier-applications` | `GET`, `PATCH` | `requireAdminSimple` | [source](../app/api/admin/supplier-applications/route.ts) |
| `/api/admin/supplier-uploads/backfill` | `POST` | `requireAdmin` | [source](../app/api/admin/supplier-uploads/backfill/route.ts) |
| `/api/admin/supplier-uploads/by-supplier/[id]` | `GET` | `requireAuth` | [source](../app/api/admin/supplier-uploads/by-supplier/[id]/route.ts) |
| `/api/admin/supplier-uploads/delete` | `DELETE` | `requireAdmin` | [source](../app/api/admin/supplier-uploads/delete/route.ts) |
| `/api/admin/supplier-uploads/import` | `POST` | `requireAuth` | [source](../app/api/admin/supplier-uploads/import/route.ts) |
| `/api/admin/supplier-uploads/resolve` | `POST` | `requireAuth` | [source](../app/api/admin/supplier-uploads/resolve/route.ts) |
| `/api/admin/supplier-uploads` | `GET` | `requireAuth` | [source](../app/api/admin/supplier-uploads/route.ts) |
| `/api/admin/suppliers/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/admin/suppliers/[id]/route.ts) |
| `/api/admin/suppliers` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/suppliers/route.ts) |
| `/api/admin/users/[id]` | `GET`, `PATCH`, `DELETE` | `requireAdmin` | [source](../app/api/admin/users/[id]/route.ts) |
| `/api/admin/users` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/admin/users/route.ts) |

### Authentication

| Route | Exported methods | Named guard signals in file | Handler source |
| --- | --- | --- | --- |
| `/api/auth/forgot` | `POST` | — | [source](../app/api/auth/forgot/route.ts) |
| `/api/auth/google` | `POST` | — | [source](../app/api/auth/google/route.ts) |
| `/api/auth/login` | `POST` | — | [source](../app/api/auth/login/route.ts) |
| `/api/auth/logout` | `POST` | — | [source](../app/api/auth/logout/route.ts) |
| `/api/auth/me` | `GET` | `verifyToken`, `withAuth` | [source](../app/api/auth/me/route.ts) |
| `/api/auth/refresh` | `POST` | — | [source](../app/api/auth/refresh/route.ts) |
| `/api/auth/register` | `POST` | — | [source](../app/api/auth/register/route.ts) |
| `/api/auth/reset` | `POST` | — | [source](../app/api/auth/reset/route.ts) |
| `/api/auth/signin` | `POST` | — | [source](../app/api/auth/signin/route.ts) |
| `/api/auth/signup` | `POST` | — | [source](../app/api/auth/signup/route.ts) |
| `/api/auth/verify` | `GET` | — | [source](../app/api/auth/verify/route.ts) |

### Storefront, accounts, integrations and legacy adapters

| Route | Exported methods | Named guard signals in file | Handler source |
| --- | --- | --- | --- |
| `/api/b2b/leads` | `POST` | — | [source](../app/api/b2b/leads/route.ts) |
| `/api/bags/[id]/items` | `POST`, `PATCH`, `DELETE` | `requireAuth` | [source](../app/api/bags/[id]/items/route.ts) |
| `/api/bags/[id]` | `GET`, `PUT`, `DELETE` | `requireAuth` | [source](../app/api/bags/[id]/route.ts) |
| `/api/bags/reorder` | `POST` | `verifyToken` | [source](../app/api/bags/reorder/route.ts) |
| `/api/bags` | `GET`, `POST` | `requireAuth` | [source](../app/api/bags/route.ts) |
| `/api/blogs/[slug]` | `GET` | — | [source](../app/api/blogs/[slug]/route.ts) |
| `/api/blogs` | `GET` | — | [source](../app/api/blogs/route.ts) |
| `/api/categories` | `GET`, `POST` | `requireAdmin` | [source](../app/api/categories/route.ts) |
| `/api/collections/[slug]` | `GET` | — | [source](../app/api/collections/[slug]/route.ts) |
| `/api/collections` | `GET` | — | [source](../app/api/collections/route.ts) |
| `/api/contact` | `POST` | — | [source](../app/api/contact/route.ts) |
| `/api/dashboard/customer` | `GET` | `requireAuth` | [source](../app/api/dashboard/customer/route.ts) |
| `/api/dashboard/supplier` | `GET` | `requireAuth` | [source](../app/api/dashboard/supplier/route.ts) |
| `/api/dev/send-test-email` | `POST` | `NODE_ENV` | [source](../app/api/dev/send-test-email/route.ts) |
| `/api/intelligence/me` | `GET`, `POST` | `requireAuth` | [source](../app/api/intelligence/me/route.ts) |
| `/api/mcp` | `POST`, `GET`, `DELETE`, `OPTIONS` | `NODE_ENV` | [source](../app/api/mcp/route.ts) |
| `/api/messages/[id]/read` | `PUT` | — | [source](../app/api/messages/[id]/read/route.ts) |
| `/api/messages` | `POST`, `GET` | — | [source](../app/api/messages/route.ts) |
| `/api/newsletter` | `POST` | — | [source](../app/api/newsletter/route.ts) |
| `/api/newsletter/unsubscribe` | `POST` | — | [source](../app/api/newsletter/unsubscribe/route.ts) |
| `/api/notifications` | `GET`, `PATCH` | `withAuth` | [source](../app/api/notifications/route.ts) |
| `/api/orders/[id]` | `GET`, `PUT`, `PATCH`, `DELETE` | `requireAuth` | [source](../app/api/orders/[id]/route.ts) |
| `/api/orders/quote` | `POST` | `requireAuth` | [source](../app/api/orders/quote/route.ts) |
| `/api/orders/receipt` | `GET` | `requireAuth` | [source](../app/api/orders/receipt/route.ts) |
| `/api/orders/recurring/[id]` | `GET`, `PUT`, `DELETE`, `PATCH` | `requireAuth` | [source](../app/api/orders/recurring/[id]/route.ts) |
| `/api/orders/recurring` | `GET`, `POST` | `requireAuth` | [source](../app/api/orders/recurring/route.ts) |
| `/api/orders` | `GET`, `POST` | `requireAuth` | [source](../app/api/orders/route.ts) |
| `/api/permissions/[id]` | `PUT`, `DELETE` | — | [source](../app/api/permissions/[id]/route.ts) |
| `/api/permissions` | `GET`, `POST` | — | [source](../app/api/permissions/route.ts) |
| `/api/products/[id]/permanent` | `DELETE` | — | [source](../app/api/products/[id]/permanent/route.ts) |
| `/api/products/[id]` | `GET`, `PUT`, `DELETE` | — | [source](../app/api/products/[id]/route.ts) |
| `/api/products/add` | `POST` | — | [source](../app/api/products/add/route.ts) |
| `/api/products/brands/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/products/brands/[id]/route.ts) |
| `/api/products/brands` | `GET`, `POST` | `requireAdmin` | [source](../app/api/products/brands/route.ts) |
| `/api/products/categories/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/products/categories/[id]/route.ts) |
| `/api/products/categories` | `GET`, `POST` | `requireAdmin` | [source](../app/api/products/categories/route.ts) |
| `/api/products/enhance-details` | `POST` | — | [source](../app/api/products/enhance-details/route.ts) |
| `/api/products/exists/[sku]` | `GET` | — | [source](../app/api/products/exists/[sku]/route.ts) |
| `/api/products` | `GET` | — | [source](../app/api/products/route.ts) |
| `/api/profile` | `PATCH` | `verifyToken` | [source](../app/api/profile/route.ts) |
| `/api/referrals` | `GET`, `POST`, `PATCH` | `verifyToken` | [source](../app/api/referrals/route.ts) |
| `/api/reviews` | `GET`, `POST` | `verifyToken` | [source](../app/api/reviews/route.ts) |
| `/api/roles/[id]/permissions/[permissionId]` | `DELETE` | — | [source](../app/api/roles/[id]/permissions/[permissionId]/route.ts) |
| `/api/roles/[id]/permissions` | `POST` | — | [source](../app/api/roles/[id]/permissions/route.ts) |
| `/api/roles/[id]` | `GET`, `PUT`, `DELETE` | — | [source](../app/api/roles/[id]/route.ts) |
| `/api/roles` | `GET`, `POST` | — | [source](../app/api/roles/route.ts) |
| `/api/storefront/home` | `GET` | — | [source](../app/api/storefront/home/route.ts) |
| `/api/storefront/products/[id]` | `GET` | — | [source](../app/api/storefront/products/[id]/route.ts) |
| `/api/storefront/products` | `GET` | — | [source](../app/api/storefront/products/route.ts) |
| `/api/subscription-plans/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | [source](../app/api/subscription-plans/[id]/route.ts) |
| `/api/subscription-plans` | `GET`, `POST` | `requireAdminSimple` | [source](../app/api/subscription-plans/route.ts) |
| `/api/subscriptions/[id]` | `GET`, `PATCH` | `verifyToken` | [source](../app/api/subscriptions/[id]/route.ts) |
| `/api/subscriptions` | `GET`, `POST` | `verifyToken` | [source](../app/api/subscriptions/route.ts) |
| `/api/suppliers/register` | `POST` | `verifyToken` | [source](../app/api/suppliers/register/route.ts) |
| `/api/suppliers/upload/delete` | `DELETE` | `requireAuth` | [source](../app/api/suppliers/upload/delete/route.ts) |
| `/api/suppliers/upload` | `POST` | `requireAuth`, `NODE_ENV` | [source](../app/api/suppliers/upload/route.ts) |
| `/api/upload/images/products` | `POST` | — | [source](../app/api/upload/images/products/route.ts) |
| `/api/users/exists/[userId]` | `GET` | — | [source](../app/api/users/exists/[userId]/route.ts) |
| `/api/users/register` | `POST` | — | [source](../app/api/users/register/route.ts) |
| `/api/wishlist/[productId]` | `DELETE` | `requireAuth` | [source](../app/api/wishlist/[productId]/route.ts) |
| `/api/wishlist` | `GET`, `POST` | `requireAuth` | [source](../app/api/wishlist/route.ts) |

### Notifications

- `GET /api/notifications`: current database-backed access session; `page` (1+), `limit` (1–50, default 20), optional `unread=true`. Returns recipient/broadcast `data`, pagination and global `unreadCount`. Private/no-store; receipt state belongs to the caller. The older `GET /api/admin/notifications` delegates to this reader.
- `PATCH /api/notifications`: `{ ids: string[] }` (1–50). Marks eligible caller notifications read using duplicate-safe receipts. If any ID is missing or belongs to someone else, the entire request returns 404 before writing. Unknown and private IDs are indistinguishable. Repeated reads succeed.
- `POST /api/admin/notifications`: database-verified admin; trimmed title (1–200), message (1–5,000), enum type, targetUserId (`all` by default or an active account ID), optional local link and optional submissionId UUID. Returns 201/new, 200/exact retry, 409/reused identifier with changed intent, 400/invalid input or 404/unavailable target. Admin UI supplies the retry identifier. Legacy clients omitting it are not deduplicated. New sends write one audit record atomically.
