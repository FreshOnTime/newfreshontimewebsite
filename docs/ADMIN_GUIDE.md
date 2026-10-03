# FreshPick admin panel handbook

This handbook documents the current operator interface and every retained `/admin` page. For technical contracts use the [API reference](API_REFERENCE.md) and [function reference](FUNCTION_REFERENCE.md). Basket operations have an expanded [subscription guide](SUBSCRIPTIONS.md).

## Access and responsibilities

Sign in with a real administrator account, then open `/admin`. The layout restricts administration and uses private/no-index metadata. The sidebar groups Store, Publishing, Support and Business; mobile navigation opens as a dialog. **View store** returns to the customer site.

Most modern admin APIs use a shared guard that rechecks the database user, banned status and primary or secondary `admin` role. Some legacy tools still check only the primary role or use older token checks. A secondary admin role is therefore not a guarantee that every retained tool works. Roles such as inventory manager, order processor or marketing specialist are stored enum values, not a complete, centrally enforced permission matrix for this panel. Legacy dynamic role/permission editors do not automatically grant shared-admin access.

The first admin is provisioned by a trusted database operator; the public seed endpoints are disabled. Existing admins can promote an existing non-banned user from Overview. See [developer setup](DEVELOPER_GUIDE.md) for a controlled bootstrap procedure.

Use personal accounts for actions. Preserve customer/order history; prefer archival, inactivity or account banning to destructive deletion where appropriate. Audit entries are best-effort and not universal across every legacy endpoint; do not treat the audit log as a complete financial ledger.

## Complete page map

| Page | Access from interface | Purpose |
| --- | --- | --- |
| `/admin` | Overview | Store summary, recent activity/customers, admin promotion and uploads |
| `/admin/orders` | Orders | Order fulfilment, payment/status records and recurring templates |
| `/admin/products` | Products | Catalog, stock, prices and product photography |
| `/admin/categories` | Categories | Primary shopping classifications |
| `/admin/customers` | Customers | Customer contacts, addresses and order history |
| `/admin/subscriptions` | Subscriptions | Recurring basket plans |
| `/admin/subscription-deliveries` | Link from Subscriptions | Basket preparation queue and blocked fulfilment |
| `/admin/suppliers` | Suppliers | Producer/business records |
| `/admin/supplier-applications` | Supplier review link | Pending supplier approvals/rejections |
| `/admin/supplier-uploads` | Supplier uploads link | Preview/download/import/repair spreadsheets |
| `/admin/blogs` | Blog | Editorial posts, draft/publish and SEO fields |
| `/admin/newsletter` | Newsletter | Consent list and unsubscribe |
| `/admin/collections` | Collections | Optional themed product stories |
| `/admin/enquiries` | Enquiry inbox | Customer support triage |
| `/admin/business-leads` | Business enquiries | B2B lead pipeline |
| `/admin/analytics` | Reports | Operational summaries and recurring-order reporting |
| `/admin/users` | Retained direct URL | Broader account and role maintenance |
| `/admin/audit-logs` | Retained direct URL | Recorded admin activity filters |
| `/admin/notifications` | Retained direct URL | In-app notification creation |
| `/admin/bundles` | Retained direct URL | Separate priced bundle products |
| `/admin/intelligence` | Retained direct URL | Deterministic stock/forecast recommendations |

Retained direct tools are not all advertised in the primary navigation. Their presence is not a recommendation to activate them without checking the limitations below. Recipes have no active admin editor. Legacy `/dashboard` category, brand and role/permission screens are separate from this main panel.

## 1. Overview

Overview surfaces store metrics, recent customers, recent activities, supplier uploads and an enquiry shortcut. Use it for orientation; act on orders and tickets in their dedicated pages.

**Make user admin:** enter an existing user UUID (phone lookup is also supported by the endpoint), check that it is the intended account, then submit. The API requires an existing admin, rejects banned users and changes the target's primary role to admin. This is a privilege grant, not a customer invitation or account registration. The promotion is audited.

Metric definitions matter:

| Metric | Current calculation |
| --- | --- |
| Customers | Users whose primary role is customer |
| Active products | Non-archived catalog products |
| Orders / pending orders | Non-template orders; recurring templates excluded |
| Revenue | Non-template orders delivered **or** payment status paid |
| Low stock | `stockQty <= minStockLevel` |
| Active recurring orders | Active recurring **order templates**, not basket subscriptions |
| Recurring revenue | Generated orders with a recurring source and delivered or paid state |
| Upcoming recurring | Up to ten active templates due within the report's next 14 days |

Revenue is an operational indicator, not proof of COD settlement, tax reporting or an accounting reconciliation.

## 2. Orders

### Find and inspect

Search by order number; customer links open Orders with a customer UUID filter. Use ordinary/recurring and schedule-state filters to separate deliveries from templates. Sorting includes creation order and next-delivery order; paginate instead of assuming the displayed page is the complete history.

Open an order to inspect customer, item lines, historical prices/totals, recipient, payment/status, tracking, dates and notes. For stock-managed baskets, use the linked delivery as well: ordinary order and basket transitions are synchronized.

### Create an order

Use the new-order dialog, search for the customer and products, add quantities, enter recipient/address and select the recorded payment method. Server-side validation and stock handling remain authoritative; catalog line prices are reloaded by the server. Admin shipping, tax and discount fields are recorded subject to validation and discount bounds; customer checkout has a stricter discount policy. Verify the saved result before communicating the amount.

Administrative payment labels include cash, card, bank transfer and digital wallet. These describe how an order is recorded; this screen does not charge a card or refund a provider transaction.

### Edit and fulfil

The dialog supports order status, payment status, notes, tracking number, estimated/actual delivery dates, shipping address and allowed item edits. Order statuses are pending, confirmed, processing, shipped, delivered, cancelled and refunded; payment states are pending, paid, failed and refunded. These are separate: “delivered” is not synonymous with “paid”.

Typical routine: review pending → confirm → prepare/processing → shipped → delivered. Record collection/payment separately. Inspect existing stock reservation and lifecycle constraints before cancelling, reopening or changing item quantities. The server claims current state/update timestamp and applies inventory changes in a transaction, so conflicting writers can receive 409.

For basket-linked orders, composition and pricing are locked to the basket snapshot. You cannot treat them as freely editable ordinary orders or cancel a shipped/delivered basket backward. Refunding a recorded order status is not automatic monetary reimbursement.

**Recurring templates:** inspect recurrence, schedule status and next date in the dialog; use active/paused/ended to control future instances. The template itself is not a pending stock-reserved delivery. Do not convert an existing ordinary order into a template by editing a flag; use the supported recurrence creation flow.

The retained recurring-order quick-action API also supports admin force-next-date, skip and duplicate. Duplicate creates a second active schedule; it can result in an additional delivery. Prefer ending/pausing to destructive template deletion: legacy recurring deletion uses status-based stock restoration that needs review when a template never reserved stock.

**Delete:** destructive deletion is distinct from cancellation. The endpoint rejects basket-linked orders and uses stock-release guards where applicable. Preserve historical orders unless a legitimate data-maintenance reason requires deletion; fulfilment mistakes are normally handled by status changes and notes.

No integrated courier booking, live location, fiscal invoicing or payment gateway should be inferred from the tracking/payment fields.

## 3. Products

Search by name or SKU; use view for inspection, edit for changes and delete to archive from the active catalog.

Product fields include name, SKU, slug, description, selling price, cost price, category, supplier, stock quantity, minimum-stock level, tags, attributes/unit options and images. Normal products require valid category and supplier IDs. Stock is an integer. SKU is normalized to uppercase and must be unique; a slug is generated when appropriate.

### Recommended publishing routine

1. Create or confirm the category and supplier.
2. Choose a unique SKU and clear product name. State the package/unit honestly.
3. Set approved price/cost and stock/minimum level. Unit options are metadata, not free-form fractional stock.
4. Upload product photography or use a valid image URL. Production uploads require durable Azure configuration.
5. Save, inspect the public listing and verify the item can be found in its category.
6. Archive unavailable/discontinued items when appropriate; keep historical references intact.

The admin list normally shows non-bundle active products. API filters support bundles-only/all and archived entries. List page size is bounded to 100. Permanent deletion exists through a separate legacy endpoint and can be blocked by relationships; it is not the routine archive button.

An image upload validates actual JPEG/PNG/WebP/AVIF content and a 4 MB limit. A filename alone is insufficient. Failed storage configuration must be fixed instead of relying on temporary production disk files.

## 4. Categories

Create, view and edit category name, slug, description, image, active flag and sort order. Category slugs must be unique. Active categories power the primary customer browsing flow; product membership follows each product's category assignment.

Use useful category photography and concise names. Keep sort order intentional. The API supports a parent category ID, but do not assume the current dialog has a full category-tree editor. The UI has no routine delete button even though an ID delete endpoint exists. Review associated products before category removal.

Some category selectors request more records than the API returns; the server still caps at 100. Large-catalog category selection needs further interface work.

## 5. Customers

The table represents **User records with primary role customer**, not a second independent customer database. View contact/address, order count and spending; open their orders from the row action. Add/edit includes name, email, phone and address. Phone is required when creating an admin contact record; email/phone uniqueness is checked.

Creation does not set a password, verify an identity or send an account invitation. Coordinate customer access through actual authentication flows. The legacy schema accepts notes, but the creation handler does not persist them; use Enquiry inbox notes for support case records.

Computed order totals are operational fields; do not assume every legacy sort label has a matching spend-based database sort. Customers with related orders may be blocked from deletion. Use Users banning for account-access restrictions instead of destroying order history. The customer sync endpoint is a retained no-op report, not an import/reconciliation job.

## 6. Subscriptions and basket queue

Subscriptions manages **plans**, not an unrestricted subscriber CRM. Create/edit plan name, descriptions, price, cadence, image, contents, active/featured state and inventory management. Choose mapped product units for automated baskets. Capacity and some display fields are supported by API/schema but not dedicated form controls.

Deactivate a plan to stop new signups and automatic due processing. Any subscription history prevents deletion, including cancelled history. Updates carry a timestamp version; a 409 means refresh rather than overwrite another operator.

The delivery queue link opens pending baskets. Filter pending/confirmed/delivered/cancelled/skipped or **Needs attention**. Normal records show a saved plan/content/price/address and linked order when present. Confirm preparation, mark delivered or cancel with a version guard. Needs attention is a failed due subscription: fix its cause and use Retry fulfilment, not a normal delivery action on its synthetic ID.

Read [Subscriptions](SUBSCRIPTIONS.md) before activating a plan. It explains stock mode vs manual mode, included delivery, monthly date alignment, price changes, cancellations and stock restoration.

## 7. Suppliers

Manage producer/business records: identity/contact, address, active/inactive status, payment terms and notes as exposed by the form. Payment terms include net periods, COD and prepaid; they are business records, not supplier payout automation. View upload history and use the message action for a database account message where an account is linked.

Manually creating a Supplier record does not automatically provision or connect a login. Review User → Supplier association when an upload has no recognizable owner. Business lead qualification also does not create that account link automatically.

### Applications `/admin/supplier-applications`

Filter pending/approved/rejected, inspect applicant/business information and save review notes with a decision. The request sends `version` using the record's `reviewVersion`; stale decisions return 409. Approval sets supplier active; pending/rejected sets inactive. Private review notes are internal.

Approved active suppliers can submit inventory; approval alone does not create or publish catalog products. Historical supplier data may have been migrated to an approved state to preserve access; review old records explicitly rather than assuming they underwent the new process.

### Uploads `/admin/supplier-uploads`

| Action | Function / effect |
| --- | --- |
| Preview | Inspect up to 20 preview rows; not necessarily the whole spreadsheet |
| Download | Retrieve original file where stored |
| Resolve / backfill | Repair legacy upload-to-supplier association using the available ownership data |
| Import | Parse original CSV or first Excel sheet where available; create valid new product rows |
| Delete | Remove upload record/file; does not delete already-imported products |

Expected column aliases include `sku`/`SKU`, `name`/`Name`, `price`/`Price`/`pricePerBaseQuantity`, `stockQty`/`stock`/`Stock`, `description`, and `categorySlug`/`category`. Price parser strips currency separators; invalid numeric text can become zero. Stock values are truncated to integers. Validate every import before publication.

Import is not a transaction for the entire file and is not an upsert. Missing SKU/name, duplicate SKUs and other row failures are reported while valid rows may already be created. Read created/error counts before retrying: repeated import can produce duplicate-SKU errors for already-created rows. If the original is missing, a legacy preview fallback can import only the stored preview rows; do not mistake that for a full-file import.

The legacy import guard checks the **primary** admin role. If a secondary-role admin sees access denied, use an authorized primary administrator and record the need to harmonize the guard; do not weaken the endpoint casually.

## 8. Blog

Search and paginate posts. New/edit controls include title, slug, excerpt, Markdown content, featured image URL/alt text, category, tags, meta title/description/keywords and published state. Author comes from the admin session.

1. Draft the story and supply meaningful image alt text.
2. Preview formatting and check image source and rights.
3. Choose a unique slug, category/tags and accurate search metadata.
4. Publish and inspect `/blog` plus the article page.
5. Keep unpublished drafts out of customer links; delete uses soft deletion.

Rendering uses sanitized Markdown. Public feeds exclude retired recipe and collection-category rows, so publishing those legacy content categories does not make them ordinary public Blog entries. There is no Recipes editor to maintain.

## 9. Collections

Collections are optional merchandising pages grouping existing products around an occasion/theme. They are not required catalog categories, fixed-price baskets or bundle products.

Create/edit title, slug, excerpt/story, eyebrow/occasion/theme, hero image/alt text, tags, selected products and publish state. The API requires 1–100 product IDs. Verify products are sellable and publish only when the collection provides a useful customer path. The current picker/list loads the first 100 products/collections; very large catalogs require additional selection work.

Collection creation does not reserve stock, discount products or affect subscription schedules. Customer items retain their own prices. Keep unused collections unpublished rather than creating generic sections merely to fill the storefront. This documentation does not remove the retained editor or change navigation.

## 10. Newsletter

Search email and filter active/inactive subscriber records; paginate 20 at a time. View opt-in state and unsubscribe using confirmation. Admin unsubscribe sends `version` using the record's `unsubscribeVersion`; stale changes return 409. There is no admin reactivation control or campaign sending/composition page.

Public signup queues a welcome/consent message. Repeat active signup gives a generic success without another welcome. Reactivation increments a consent generation, making old signed unsubscribe links invalid. Opening the public link presents confirmation; mutation is a POST, so mail scanners following GET do not unsubscribe someone.

Missing welcome mail is an outbox/provider issue until checked. Do not use consent records as a justification for unimplemented broadcast tooling.

## 11. Enquiry inbox

Filter by status (new/in_progress/resolved), source (general/producers/support), type (question/issue/suggestion/other) or search. Priority (low/normal/high) is displayed on each card; there is no priority filter. Open the reference `FP-…`, contact information, subject, message and any supplied order reference. The public `orderId` is a submitted reference, not proof of order ownership.

Routine:

1. Read a new enquiry and identify responsible staff.
2. Set in progress and record useful **private** notes.
3. Respond through your approved external customer channel; saving status or notes does not send a response.
4. Resolve after the issue is addressed and record the outcome.

Notes allow up to 5,000 characters. Writes use an integer version; reload on conflict. Public contact submissions have a rate limit and UUID-based durable retry: same payload/retry ID returns the existing case, different payload conflicts.

There is no automatic email reply, assignment system, SLA timer or full support chat thread in this editor. Do not put secrets or unnecessary sensitive data into notes.

## 12. Business enquiries

Inspect organization, contact details and requirement; move through **new → contacted → qualified → won/lost** as appropriate. Public For business submissions are persisted before optional notification email. A provider error must not be mistaken for losing the lead itself.

The current API lists up to 200 recent leads and supports status filtering. Status updates do not have the version-based protection used by Enquiry inbox; coordinate concurrent edits. Winning a lead does not approve a supplier or create a contract, order or login. Follow the separate supplier signup/application process for onboarding.

## 13. Reports

Reports displays operational totals, stock/order/customer summaries and recurring-order statistics. Definitions follow Overview. Recurring template value/average describe saved schedules; realized recurring revenue uses generated orders that meet paid/delivered criteria.

Use reports to identify work, then verify underlying orders and payment collection before financial decisions. There is no automated accounting close, supplier settlement, revenue recognition or bank reconciliation.

## 14. Secondary tools

### Users `/admin/users`

Broader account CRUD includes primary/secondary roles, addresses, banned/verified flags and retained gift-card balance fields. Changing verified flags or roles is privileged account maintenance, not proof of a verification event. Creating a record without a password does not produce an authenticated signup journey. Deletion can be blocked by linked data. A stored gift-card balance is not a working payment redemption integration.

### Audit logs `/admin/audit-logs`

Filter recorded activities by resource/action/user, dates and search; paginate bounded results (API limit up to 100). Entries may include before/after values and request metadata. Shared logging is best-effort: failure is logged rather than rolling back the underlying change. Some routes have no audit hook, so absence of an event does not prove no mutation happened.

### Notifications `/admin/notifications`

Create title/message, type (info/success/warning/error/promo), all-users or one-user target, and optional link. This stores in-app notifications. Authenticated notification reading returns the latest relevant user/broadcast records; it is not a browser push or email campaign service.

### Bundles `/admin/bundles`

Create a separate bundle product with component selections and its own price/stock fields. This differs from a collection, where products remain separate purchases, and from a recurring plan. Checkout reserves the bundle product's stock; it does not automatically decrement all component inventory. Manage bundle assembly/availability explicitly until component reservation is implemented.

### Intelligence `/admin/intelligence`

Inspect stock risk, deterministic demand/reorder suggestions and supplier availability. Treat recommendations as decision support based on recorded catalog/order data. They do not send supplier purchase orders, autonomously replenish stock or provide validated forecast accuracy.

## 15. Health and daily routine

There is no main-sidebar health page. Authorized operators/developers can use `GET /api/admin/operations/health` for uncached configuration flags, email pending/failed totals and overdue active baskets/recurring orders. The response exposes readiness indicators, not secrets. Follow [Operations](OPERATIONS.md) for logs, migrations and recovery.

Daily checklist:

1. Review pending ordinary orders and basket deliveries; confirm stock and collection plans.
2. Clear Needs attention after fixing data/stock, then retry due baskets.
3. Triage new enquiries and business leads; record responses/outcomes.
4. Review supplier applications and imports; validate new prices/images/stock.
5. Check low-stock reports and worker/outbox health.
6. Review published Blog/collections/category imagery for broken paths or stale merchandising.
7. Reconcile COD/payment records with actual collection outside the operational revenue display.

## 16. Troubleshooting

| Symptom | First checks |
| --- | --- |
| Redirect or 401 | Login/session expiry; refresh flow; environment cookie/domain settings |
| 403 in one tool | Primary vs secondary admin guard, banned account or older endpoint policy |
| 409 saving | Stale version/state, duplicate identifier, plan capacity or lifecycle conflict; reload and inspect |
| Invalid product | Required supplier/category, unique SKU/slug, numeric limits, missing/archived mapped item |
| Image upload failure | 4 MB/content type and production Azure credentials/container |
| Published content missing | Draft/deleted/category restrictions and cache revalidation |
| Missing confirmation/welcome | Database outbox, scheduled sender, provider identity and credentials |
| Due baskets absent | Active plan/subscription, schedule, worker execution; check Needs attention |
| Partial spreadsheet import | Read row errors; duplicates already imported are not an invitation to reimport blindly |
| Customer record cannot sign in | Admin creation is not password signup; use the real account flow |
| Delivery complete but payment pending | Separate payment state; reconcile collection explicitly |

Escalate with record UUID/reference, time, operation, status/error and reproducible steps. Do not include credentials or unnecessary personal information in bug reports.
