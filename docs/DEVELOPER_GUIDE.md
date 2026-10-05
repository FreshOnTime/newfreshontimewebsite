# Developer setup and maintenance

## Prerequisites

- Use **Node.js 20.17.0 and npm 10**, matching the current CI runtime. The package's older `engines` lower bound alone is not the setup recommendation for the installed Next.js 16 application.
- PostgreSQL; CI uses PostgreSQL 16. Use a dedicated development database, not production.
- Repository access and approved development values for delivery policy. External image/mail/Google services are configured separately.

Source: [package scripts](../package.json), [CI workflow](../.github/workflows/ci-cd.yml), [environment template](../.env.example).

## Local setup

```bash
git clone https://github.com/FreshOnTime/newfreshontimewebsite.git
cd newfreshontimewebsite
cp .env.example .env
```

Edit `.env` before proceeding: set `DATABASE_URL`, a long random `JWT_SECRET`, local site/frontend URLs and an approved development `DELIVERY_FEE_LKR`. Do not commit populated environment files. Prisma CLI normally reads `.env`; putting all configuration only in `.env.local` can leave CLI migrations without a database URL even when Next.js finds it.

```bash
npm ci
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. `npm ci` generates Prisma client through postinstall. `db:migrate` applies committed migrations; `db:migrate:dev` is for developing a new schema change locally. Do not run development migrations or a database reset against production.

An empty database is a valid starting state. It will not contain a live product catalog or basket offering. Add real categories/suppliers/products through authorized administration or review a development seed before running it. There are multiple legacy seed scripts (`seed`, `db:seed` and a standalone JS file); inspect their records and side effects first. Public API seed routes intentionally return 404 and are not an admin bootstrap shortcut.

## Configuration reference

| Group | Variables | Purpose / consequence |
| --- | --- | --- |
| Database | `DATABASE_URL` | PostgreSQL connection; migrations and runtime |
| Session | `JWT_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`, optional `AUTH_COOKIE_DOMAIN` | Signing/lifetime and deployment cookie scope; environment template sets 15m/30d, while JWT code fallback access lifetime is 7d. Set explicitly; stored refresh expiry currently remains 30 days |
| URLs | `NEXT_PUBLIC_SITE_URL`, `FRONTEND_URL`, optional `NEXT_PUBLIC_API_URL` | Canonical public URL, absolute mail links and optional separate API base; use correct HTTPS values in production |
| Delivery | `DELIVERY_FEE_LKR`, `DELIVERY_FREE_ABOVE_LKR`, `DELIVERY_MINIMUM_LKR`, `DELIVERY_AREAS` | Approved LKR fees, strict free threshold, minimum and allowed cities; missing required fee blocks checkout |
| Customer contacts | `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_PARTNERSHIP_EMAIL`, `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public links; WhatsApp uses international digits |
| Social | `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_X_URL` | Optional public links; empty hides icons |
| Business notifications | `B2B_INQUIRY_EMAIL` | Optional new-lead notification recipient |
| Google client | `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` | Browser Firebase configuration |
| Google server | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Server token verification; handle multiline key securely |
| Mail | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | Outbox provider and sender identity; queuing is separate from sending |
| Newsletter signing | Optional `NEWSLETTER_TOKEN_SECRET` | Separate 32+ character signing secret; otherwise uses JWT secret |
| Runtime images | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, optional `SUPABASE_STORAGE_BUCKET` | Server-only Supabase Storage configuration; default public bucket is `freshpick-images` |
| Analytics | `NEXT_PUBLIC_GA_ID` | Optional GA4 measurement ID |
| MCP | Optional `MCP_ALLOWED_ORIGINS` | Extra comma-separated permitted client origins |
| Database tests | `CHECKOUT_TEST_DATABASE_URL` | Explicit isolated database/schema for integrity tests |

Anything prefixed `NEXT_PUBLIC_` may be exposed in the browser build. Never put database credentials, JWT secrets, SendGrid keys or the Supabase secret key in a public variable. Hosting build and function contexts may differ; check [Operations](OPERATIONS.md) before deployment.

## Provision the first administrator

1. Create a normal development account through signup and confirm its exact UUID/email/phone in the target development database.
2. A trusted database operator opens `npm run db:studio`, locates that exact User and sets primary `role` to `admin`; verify `isBanned` is false. Avoid modifying an unrelated customer by a guessed identifier.
3. Sign in again, open `/admin` and verify access. Record a production bootstrap change in the operator's change log; direct database provisioning does not run the API's audit hook.
4. Subsequent grants can use Overview's Make user admin tool with an already-authorized administrator.

Do not add a public self-promotion route or enable seed endpoints to bootstrap an account. Primary-role admin avoids incompatibilities in retained legacy tools; see the [admin access explanation](ADMIN_GUIDE.md).

## Commands

| Command | Function |
| --- | --- |
| `npm run dev` | Start Turbopack development server |
| `npm run build` | Generate Prisma client, initialize upload directories, build and type-check |
| `npm run build:netlify` | Netlify-only deployment command: production migrates before build; previews only check migration status. Requires database URL in build scope |
| `npm start` | Initialize uploads and serve the built production application |
| `npm run lint` | ESLint across repository |
| `npm test` | Jest suites; inspect environment requirements |
| `npm run test:unit -- --runInBand` | Unit/API tests excluding smoke suite |
| `npm run test:smoke -- --runInBand` | HTTP checks against running application (`BASE_URL`) |
| `npm run test:checkout-db` | Real PostgreSQL checkout/stock/scheduling integrity checks; isolated schema required |
| `npm run db:migrate` | Apply existing committed migrations |
| `npm run db:migrate:dev` | Develop migrations locally |
| `npm run db:studio` | Inspect/edit target database; check which database is selected |
| `npm run check:production -- --config-only` | Read-only configuration readiness check |
| `npm run check:production` | Read-only config plus migration-state checks |
| `npm run build-skip-types` | Retained emergency script bypassing type checks; not a release-validation substitute |

## Testing and CI

CI checks out the branch, installs dependencies, applies migrations, runs lint and unit/API tests, checks commerce integrity in an isolated schema, builds, starts the built app and runs HTTP smoke tests. Read the workflow for current values instead of copying credentials to another environment.

Before changing checkout, stock, idempotency or scheduling, run the relevant unit/API cases and isolated database integrity checks. These operations need failure and competing-write verification, not just a successful UI click. Before a pure documentation change, validate source references, routes, HTTP methods, links and Markdown structure; rerunning commerce suites locally is not necessary without application changes.

Do not use the production database for tests. Review the integrity script's isolation guards and [test runbook](OPERATIONS.md) before invoking it. Smoke tests require a server and may require database/config setup; `npm run dev` starting successfully is not proof of production readiness.

## Working on scheduled features

`netlify/functions/process-recurring-orders.ts` configures 15-minute processing of ordinary recurring templates and subscription baskets. `netlify/functions/process-email-outbox.ts` configures minute-level mail processing. Development Next.js does not execute these schedules automatically. Use staging and the host's supported manual function execution to verify due records and outbox sends, then inspect logs and resulting data. Do not expose a public unauthenticated cron trigger as a convenience.

## Code conventions and source maps

- Use existing service/validation modules rather than copying inventory arithmetic into a page or route.
- Await App Router dynamic params where required by the current route signatures.
- Serialize Prisma Decimal values and compatibility `_id` consistently.
- Derive owner identity from session, not request payload.
- Pass the transaction into email queueing when mail should exist only if the commerce write commits.
- Respect timestamp/integer version fields for concurrent edits and report 409 accurately to users.
- Use sanitized Markdown and escaped JSON-LD; do not inject untrusted content into scripts.
- Preserve legacy data without presenting retired recipes or unsupported rewards as active offerings.

Find functions in [Function reference](FUNCTION_REFERENCE.md), routes in [API reference](API_REFERENCE.md), and schema in [Architecture](ARCHITECTURE.md).

## Deployment and handover

Follow [Operations](OPERATIONS.md) for backup, migration order, build/function configuration, image persistence, email delivery and rollback. Apply migrations before serving code that requires them. Run the read-only production check, then verify real customer/admin flows in the deployed environment. Record live worker execution, storage persistence and provider sends; a passing build alone cannot establish those facts.

No automated card billing, newsletter campaign tool, real courier integration or universal granular role enforcement is included by configuration. Those require additional implementation, not more environment values.
