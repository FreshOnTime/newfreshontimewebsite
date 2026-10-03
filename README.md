# FreshPick

FreshPick is a Sri Lankan food marketplace with customer shopping, producer onboarding, Blog publishing and an admin panel. It runs as a Next.js application backed by PostgreSQL/Prisma, with transactional email, durable image storage and scheduled recurring deliveries.

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
