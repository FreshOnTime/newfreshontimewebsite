# FreshPick

**A Sri Lankan online fresh-food marketplace connecting customers, local producers and the team operating grocery fulfilment.** FreshPick combines a consumer storefront, customer accounts and bags, producer onboarding, catalogue and editorial content, cash-on-delivery checkout, recurring baskets and an extensive back-office administration system.

> **Scope:** This repository is the FreshPick **Next.js web application and its built-in API**, not merely a landing page. Features exist in code, but live fulfilment, external integrations, actual product availability and deployment readiness depend on production configuration and operational acceptance. No online card charging or automatic recurring payment collection is implemented.

## What the application does

FreshPick addresses a connected set of grocery commerce workflows:

| Audience | Main jobs supported by the application |
| --- | --- |
| **Customers** | Browse fresh products by category, search and filter, maintain saved bags and wishlist, place cash-on-delivery orders, view order history, manage profile and addresses |
| **Recurring basket customers** | Choose available basket plans, manage subscriptions, and use supported pause/skip/cancel flows |
| **Producers and suppliers** | Register and submit a supplier application, access supplier areas and submit catalogue data for administrative review/import |
| **Store operations / administrators** | Manage products, categories, suppliers, collections, bundles, orders, customers, stock-related flows, subscription deliveries and enquiries |
| **Content and growth teams** | Publish blog content, curate product collections, maintain newsletter subscriptions, view reports and process business partnership enquiries |
| **External catalogue clients** | Use the constrained, public, **read-only** MCP product discovery endpoint (not account or order access) |

**Example customer journey:** A customer opens the FreshPick shop, browses a product category, adds several items to a saved bag, chooses a delivery address and completes a cash-on-delivery checkout. The server recalculates prices, validates the delivery policy and stock availability, and creates an order. Administrators then manage fulfilment. For recurring baskets, a separate scheduled workflow can produce delivery records and, only in stock-managed mode, reserve products and create associated COD orders.

## Implemented architecture

~~~mermaid
flowchart TD
  Visitor["Customer / producer / admin browser"] --> UI["Next.js App Router<br/>React + TypeScript + Tailwind CSS"]
  UI --> API["Next.js app/api routes"]
  MCP["Public read-only MCP client"] --> API
  API --> Domain["Domain services<br/>authentication, catalogue, pricing,<br/>checkout, subscriptions, validation"]
  Domain --> Prisma["Prisma ORM"]
  Prisma --> PG[("PostgreSQL<br/>authoritative commerce records")]
  API --> IMG["Supabase Storage<br/>persistent product/category/blog images"]
  API --> AUTH["Password/JWT + optional<br/>Firebase-verified Google login"]
  Worker["Netlify scheduled functions<br/>recurring orders, baskets, email"] --> Domain
  PG --> Outbox["Durable email outbox"]
  Outbox --> Mail["SendGrid email provider"]
~~~

**Key boundaries:** Customer and admin frontend pages call Next.js route handlers, which use server-side business logic and Prisma to operate on PostgreSQL. The checkout path has stock-guarded writes and idempotency logic. Basket and recurring-order processes are distinct. Scheduled Netlify functions are deployed workers, **not automatically running local development processes**. Outbox persistence does not guarantee that an external email has been delivered. Product/category/blog uploads need configured durable storage on serverless hosting.

### Technology stack

| Layer | Codebase technology | Purpose |
| --- | --- | --- |
| UI / application | **Next.js 16**, React 18, TypeScript | Storefront, accounts, producer and admin experiences; server routes |
| Styling / components | Tailwind CSS, Radix UI components | Responsive commerce and administration interfaces |
| Data | **PostgreSQL + Prisma 6** | Products, suppliers, customers, orders, stock, subscriptions, publishing and operational state |
| Authentication | bcrypt, JWT access/refresh session flows; optional Firebase/Google | Password and external identity workflows; role-aware API guards |
| External media | **Supabase Storage** | Durable runtime uploads for images (requires provider configuration) |
| Email | SendGrid via database email outbox | Transactional and opted-in communications; background retry |
| Scheduled jobs | Netlify functions | Recurring orders, basket deliveries and outbox processing on host schedules |
| Other integration | MCP SDK, optional Google Analytics | Public read-only catalogue discovery and measurement |
| Validation / QA | Jest, ESLint, TypeScript, PostgreSQL integrity scripts and CI | Business logic and migration/build regression checks |

Although Firebase and older migration-oriented adapters remain in the dependency tree, **PostgreSQL/Prisma is the authoritative database** for this application. The presence of a dependency is not proof that a separately deployed service is configured or functional.

### Source structure

| Directory | Responsibility |
| --- | --- |
| **app/** | Storefront, accounts, bags, checkout, subscriptions, blog, admin pages and HTTP APIs |
| **components/**, **contexts/** | UI controls, customer state and reusable interactions |
| **lib/** | Catalog, pricing, delivery, authorization, email and integration helpers |
| **prisma/** | Relational data model, versioned database migrations and seed support |
| **netlify/functions/** | Scheduled operational jobs |
| **public/** | Static public assets |
| **scripts/**, **__tests__/** | Build/check scripts, browser/HTTP and financial/commerce integrity verification |
| **docs/** | Product, admin, developer, data-flow, API, operations and release-readiness guides |

## Feature maturity and product boundaries

| Area | Implementation status |
| --- | --- |
| Browse/search catalogue, product details, bags, wishlist, customer profiles and order history | **Implemented in application** — populated catalogue and accounts required |
| COD checkout, stock checks, addresses, order lifecycle and admin operations | **Implemented** — approved LKR delivery configuration and operational verification required |
| Recurring orders and subscription baskets | **Implemented** — manual and stock-managed basket fulfilment are different modes; deployed scheduling must be verified |
| Supplier applications, uploads and admin-managed product publishing | **Implemented** — approval/import is not automatic public listing |
| Blog publishing, collections, enquiries, newsletter signup, dashboards | **Implemented** — campaign blast sender and external customer-reply automation not implied |
| Transactional email, scheduled jobs and durable image uploads | **Provider-backed implementation** — SendGrid, Netlify and Supabase credentials/configuration required |
| Read-only MCP product search, product lookup and category listing | **Implemented** — no purchase, private account or administrative action |
| Card checkout, recurring card billing, live courier dispatch and omnichannel delivery tracking | **Not implemented** |
| Universal fine-grained role enforcement across every legacy route | **Not certified** — review older guards before public enterprise use |

**Production notice:** Running the application and passing unit/build/CI checks are different from validating real payment/fulfilment operations, images, email providers, cloud schedules, security posture or an actual live inventory dataset. Follow [Platform readiness](docs/PLATFORM_READINESS.md) and [Operations](docs/OPERATIONS.md) before handling real customer traffic.

## Documentation

Start with the [complete documentation index](docs/README.md).

| Guide | Contents |
| --- | --- |
| [Platform features](docs/FEATURES.md) | Customer journeys, producers, communication, discovery and implemented limits |
| [Admin panel handbook](docs/ADMIN_GUIDE.md) | All 21 admin pages, every operational workflow, daily checklist and troubleshooting |
| [Subscriptions and recurring orders](docs/SUBSCRIPTIONS.md) | Basket plans, pause/skip/cancel, pricing, stock, scheduling and delivery queue |
| [Developer setup](docs/DEVELOPER_GUIDE.md) | Configuration, first admin, commands, tests and handover |
| [Architecture](docs/ARCHITECTURE.md) | Data relationships, transaction boundaries, auth and integrations |
| [API reference](docs/API_REFERENCE.md) | 113 route files / 190 exported HTTP handlers and core request contracts |
| [Function reference](docs/FUNCTION_REFERENCE.md) | All public domain-service methods, critical helpers and admin actions |
| [Operations](docs/OPERATIONS.md) | Backups, migrations, deployment, outbox, workers and recovery |
| [Readiness](docs/PLATFORM_READINESS.md) | Production requirements and verification evidence |
| [Product and agentic commerce roadmap](docs/ROADMAP.md) | Phased AI shopping, replenishment, supplier/operations copilots, safety gates and implementation tasks (**planned, not shipped**) |
| [Public MCP](docs/mcp.md) | Read-only catalog tools and remote client connection |

## Local development

Use Node.js 20.17.0 (the current CI runtime), npm and a dedicated PostgreSQL database.

```bash
git clone https://github.com/FreshOnTime/newfreshontimewebsite.git
cd newfreshontimewebsite
cp .env.example .env
```

Set `DATABASE_URL`, a long random `JWT_SECRET`, local site/frontend URLs and an approved development `DELIVERY_FEE_LKR` in `.env`. Keep secrets out of git. Prisma CLI reads `.env`; Next.js-only `.env.local` configuration can leave migrations without a database connection.

```bash
npm ci
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. An empty database has no published products or subscription plans. Read the [setup guide](docs/DEVELOPER_GUIDE.md) before seeding data or provisioning the first administrator.

## Planned: agentic commerce

The [FreshPick product and agentic-commerce roadmap](docs/ROADMAP.md) sets out the proposed implementation of a budget-aware grocery assistant, reviewable shopping bags, opt-in replenishment, operations/supplier copilots and a future authenticated agent integration. **These workflows are not implemented by the current read-only MCP server.** Existing pricing, stock checks, COD checkout, access controls and explicit user approval remain authoritative.

## Important product boundaries

- Customer checkout and subscription baskets use cash on delivery; no automatic card charging or recurring payment collection is implemented.
- Subscription baskets and recurring grocery orders are separate systems. Manual basket mode creates delivery records; stock-managed mode reserves catalog stock and creates linked COD orders when due.
- Newsletter consent management exists; bulk campaign composition/sending does not.
- Contact submissions enter the admin Enquiry inbox. Saving status/private notes does not send a customer reply.
- Collections are optional themed product groups, distinct from categories, bundles and subscriptions. Recipes are retired.
- Legacy role, reward and adapter routes require care; documented records/forms do not guarantee universal permissions, verified reward issuance or external integrations.

## Validation and deployment

```bash
npm run lint
npm run test:unit -- --runInBand
npm run build
```

Commerce changes also require isolated PostgreSQL integrity checks; built-server HTTP checks use the smoke suite. See [testing setup](docs/DEVELOPER_GUIDE.md) before running database tests. CI executes lint, unit/API tests, isolated commerce checks, build and smoke checks.

Follow the [operations runbook](docs/OPERATIONS.md) for backup, migration order, production image storage, mail workers and scheduled execution. A successful build is not proof that live provider credentials or host schedules work. Source behavior documented here was reviewed on 3 October 2026; deployed verification is a separate responsibility.
