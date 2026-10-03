# Platform features and user journeys

Read this alongside the [documentation index](README.md). This is the implemented feature inventory, not a list of promised future capabilities.

## Customer storefront

| Feature | Customer function | Administration or dependency |
| --- | --- | --- |
| Home `/` | Editorial carousel, category entry points, product sections and Blog discovery | Active catalog and published content; page composition in `app/page.tsx` |
| Shop `/products` | Browse, search, filter and open product details | Products, categories, supplier records and stock |
| Categories `/categories`, `/categories/[slug]` | Shop by a product classification | Active categories; individual products assigned to categories |
| Product `/products/[id]` | See image, description, price, unit information and availability; add to bag/save | Public product lookup supports compatibility identifiers; catalog UUID/SKU/slug handling lives in the API |
| Search `/search` | Find products by a query | Catalog search routes; results reflect published catalog data |
| Deals `/deals` | Find catalog promotions | Product promotional price fields; checkout recalculates current price |
| Discover `/discover`, For you `/for-you` | Explore curated/recommended products | Deterministic catalog and purchase-history helpers; no LLM buying agent |
| Collections `/collections`, `/collections/[slug]` | Browse themed groups of individually sold products | Collection publishing; does not create a discounted basket or reserve stock |
| Weekly baskets `/subscriptions` | Select a fixed-price recurring basket plan | Active subscription plans and fulfilment mode; see [Subscriptions](SUBSCRIPTIONS.md) |
| Saved products `/wishlist` | Maintain an authenticated saved-product list | Account-owned wishlist records |
| Bags `/bags`, `/bags/[id]` | Maintain saved grocery selections | Ownership checks; saved prices must be refreshed at checkout |
| Checkout `/checkout` | Choose recipient address and submit a grocery order or plan subscription | Authentication, delivery policy, stock and idempotency receipt |
| Orders `/orders`, `/orders/[id]` | View own order details and status | Admin order workflow; tracking reference is recorded, not a live courier integration |
| Profile `/profile` | Manage account details and address information | User/address APIs |
| Account dashboard `/dashboard` | Customer or supplier overview; supplier inventory upload entry | Role-specific dashboard APIs; legacy catalog/settings screens are separate retained tools |
| My baskets `/profile/subscriptions` | View subscriptions; pause, resume, skip or cancel | Subscription ownership and state checks |
| Blog `/blog`, `/blog/[slug]` | Read published editorial posts | Blog editor; unpublished and retired content types excluded from public feeds |
| For business `/b2b` | Submit a business enquiry and discover supplier onboarding | Business-lead inbox and separate supplier account application |
| About `/about`, Our producers `/farm-to-table` | Learn about the market, producers and sourcing | Editorial page content and photography |
| Homemade `/homemade`, Meals `/meals`, Diaspora `/diaspora` | Market-specific discovery and information pages | Links back into catalog and business/customer journeys |
| Contact `/contact`, Help `/help`, Help us `/help-us` | Submit questions, issues or suggestions | Admin enquiry inbox; saving a ticket update does not send an email reply |
| Newsletter signup and `/newsletter/unsubscribe` | Opt in or confirm unsubscribe | Signed consent links, transactional outbox and SendGrid worker |
| Policies `/refund`, `/privacy`, `/terms`, `/cookies` | Read store and privacy policies | Published text must be checked against actual business practice |
| Site map `/site-map`, landing `/landing`, offline `/offline` | Navigation, alternate entry page and offline fallback | Sitemap/manifest/service-worker support; offline checkout is not offered |

Legacy aliases and redirects remain in the source, including account signup variants and `/about-us`. Recipes have been retired from the active storefront, admin and MCP features; old records are not a reason to restore a recipe editor.

## Shopping and checkout, step by step

1. Browse categories or products, then add quantities to a bag. Product unit metadata describes the offered item; stock and checkout quantities are whole catalog units.
2. Sign in and select an address. A saved profile address is converted into the checkout address shape for groceries and subscriptions; postcode is optional. Bag and subscription requests recover an expired access session once. Bag state is scoped to the active account, ignores superseded reads, and serializes quantity writes.
3. The server resolves products, merges duplicate identifiers, checks availability and derives current sale prices. Client totals are not authoritative.
4. Delivery area, approved delivery fee, minimum order and free-delivery threshold are evaluated on the server. Free delivery applies **strictly above** the configured threshold, not at equality. Tax is currently zero.
5. An ordinary order reserves stock transactionally. If any item fails its price/stock guard, the transaction rolls back instead of partially ordering the bag.
6. The browser sends an `Idempotency-Key`. A matching retry returns the original result; reusing that key for a different intent returns a conflict. This protects against uncertain network responses and double submissions.
7. An order confirmation is queued in the database. Sending requires an operating email worker and configured provider. An order can be recorded successfully before the email is delivered.
8. The administrator prepares and fulfils the order; the customer sees recorded status changes.

Customer checkout currently supports **cash on delivery**. Card, transfer and wallet choices in administration are record fields, not evidence of an integrated charging/refund gateway. There is no automatic recurring card debit.

## Two different recurring features

| Question | Subscription basket | Recurring grocery order |
| --- | --- | --- |
| Customer chooses | A named plan | A saved order's grocery items |
| Price | Current plan price at each delivery creation | Current catalog sale prices and delivery charge |
| Cadence | Weekly, biweekly or monthly on a chosen weekday | Recurrence days/dates; worker also supports stored RRULE patterns |
| Data | `SubscriptionPlan`, `Subscription`, `SubscriptionDelivery` | An `Order` template and generated `Order` instances |
| Admin tool | Subscriptions → basket delivery queue | Orders → recurring filters and schedule editor |
| Stock | Manual mode: no automatic reservation. Stock mode: transactional reservation and linked COD order | Generated instance reserves stock when due; template itself does not |
| Customer controls | Pause, resume, skip, cancel | Recurring-order API for schedule/items/address and schedule status |

Full lifecycle, pricing and operational examples are in [Subscriptions](SUBSCRIPTIONS.md).

## Accounts and authentication

Email/password signup, login, verification, forgot/reset password and refresh/logout flows are implemented. Passwords are hashed; refresh tokens are hashed and rotated. Google login uses Firebase identity verification and links compatible verified email accounts. New Google users can supply a missing phone number for delivery.

Stored addresses include recipient, street, town/city, state, postal code, country code, phone and address type. Order addresses are historical checkout snapshots, not live links that change when a customer edits their profile.

Customer and supplier registrations are separate. A supplier application creates a linked supplier record in a pending/inactive state. Approval is an administrator action; it is not automatic because a signup succeeded.

Admin-created customer records are contact/account records without a password in that creation flow. They do not automatically become usable password logins. Customer notes accepted by the legacy customer schema are not persisted by its creation handler; do not depend on that field for support records.

## Supplier workflow

1. A producer applies through supplier signup with account and business details.
2. Admin reviews the application, records private notes and approves or rejects it with a version check.
3. Approved active suppliers can upload an inventory spreadsheet.
4. Admin previews the upload and imports it explicitly. Upload approval does not publish products by itself.
5. The import creates new product rows for valid entries. It is not a SKU upsert: duplicate SKUs and invalid rows are reported separately. A batch can have partial success.
6. Admin checks categories, prices, quantities and images before expecting the new products to make a useful customer-facing listing.

Supplier records created manually and supplier login accounts are separate relationships. Review the linked user/supplier association when repairing an old upload. Spreadsheet originals can be stored inline or through the legacy file path; product-photo storage follows the Azure production configuration.

## Content and communication

- **Blog:** Markdown articles, preview/edit, featured image/alt text, category, tags, metadata and publish/draft state. Public feeds exclude retired recipe and collection categories. Deleting a Blog post is a soft delete.
- **Collections:** Published stories and selected products for themes or occasions. A collection does not alter product prices. It is optional merchandising, distinct from mandatory category navigation.
- **Newsletter:** Signup, consent status and signed unsubscribe. Admin can search subscribers and unsubscribe with a version check. There is no bulk campaign composer, campaign analytics or admin reactivation button.
- **Enquiries:** Durable public submission with reference, type, source and priority; admin status/private notes and concurrency guard. There is no built-in outgoing reply thread.
- **Business enquiries:** Lead intake and new/contacted/qualified/won/lost pipeline. Winning a lead does not create or approve a supplier account.
- **Messages:** A retained account inbox and admin-to-user database messaging. It is separate from contact tickets and email delivery.
- **Notifications:** Retained in-app database notifications for users or all users. Browser push delivery is not provided by the notification form.

## Discovery, SEO, GEO and AEO

Public pages have canonical metadata, an XML sitemap, robots rules and structured-data helpers. Product data supports price/availability information; site and FAQ schemas support machine-readable discovery. Private administration/account surfaces use no-index metadata. `llms.txt` publishes factual catalog/site context, and the public MCP endpoint exposes read-only catalog queries.

These are technical foundations, not a guarantee of rankings, answer-engine citations or service coverage. Keep prices, stock, structured data, factual content, company details and real delivery areas consistent. Avoid using marketing page geography as a substitute for checkout's configured delivery policy.

## Integrations and prerequisites

| Integration | Implemented purpose | Required operational setup |
| --- | --- | --- |
| PostgreSQL + Prisma | Accounts, stock, orders, subscriptions, content and inbox records | Migrations, backups and secure database connection |
| Azure Blob Storage | Durable product photography | Server storage connection/container in production |
| SendGrid | Transactional messages from database outbox | API key, sender identity and scheduled outbox processing |
| Firebase | Google identity verification | Matching client and server credentials |
| Netlify Functions | Basket/recurring-order processing and mail worker | Published scheduled deployment; inspect worker logs |
| GA4 | Optional web analytics | Public measurement ID; consent/business configuration |
| MCP | Public read-only catalog search/product/category tools | Configured host/origin allowlist; client connects separately |

## Features retained with limits

| Area | Actual limitation / release decision |
| --- | --- |
| Subscription customization | Owner PATCH does not edit address/preferences. Stock-managed plans reject stored exclusions/preferences that require manual interpretation |
| Automatic payments | No customer card checkout, payment webhook or automatic recurring collection |
| Delivery logistics | Status, dates and tracking number are records; no live courier API |
| Reviews | Product review APIs exist; no dedicated admin review-moderation page |
| Referrals | Legacy reward handlers include public mutations and lack trustworthy order validation; do not launch monetary rewards until authorization and verified order events are implemented |
| Dynamic roles | Legacy role/permission records are not a complete enforced policy engine; shared admin guards use user enum roles |
| Recurring template maintenance | Version-checked template deletion leaves stock untouched; ending schedules preserves history |
| Bundles | Separate bundle product has its own stock; checkout does not automatically deplete all component products |
| Intelligence | Deterministic forecasts/reorder suggestions, not an autonomous purchasing system or certified demand forecast |
| Gift-card balance | Retained account field; not an integrated checkout redemption/payment system |
| Offline | Installable manifest and fallback; no guaranteed offline catalog or offline transactions |
| Large catalogs | Some editors load the first 100 products/categories; selection beyond that requires further UI work |

See the [Admin handbook](ADMIN_GUIDE.md) for operator procedures and [Operations](OPERATIONS.md) for deployment evidence. These gaps are documented here; this documentation change does not silently add or activate them.

### Account messages and referral ledger

Customers can read, search and filter team updates at `/profile/messages`; producer dashboards use the same inbox. Failed loads and failed read updates remain visible with retry actions. Admin producer messaging resolves linked active user accounts and preserves a submission identifier for safe retries. Unlinked producers receive an actionable error.

Referral attribution is account-scoped and must precede the first ordinary order. Admin reward recording requires evidence of a first paid, delivered purchase, atomically claims the reward and writes an audit record. Earnings are ledger entries only; checkout discounts and automatic payouts remain unavailable. Banned accounts cannot update profiles.
