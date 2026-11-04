# FreshPick on OpenChoreo: container deployment

This guide prepares FreshPick for a **staging** deployment on OpenChoreo
v1.3.x. It does not make changes to a cluster, secrets, databases or the
existing Netlify deployment. Verify all production requirements separately.

## Application topology

| Image target | OpenChoreo component | Schedule | Purpose |
| --- | --- | --- | --- |
| `production` (also default Docker target) | `deployment/web-application` | Always running | Next.js storefront and built-in private/authenticated API routes |
| `recurring` | `cronjob/scheduled-task` | `*/15 * * * *` UTC | Existing recurring-order and subscription delivery processors |
| `outbox` | `cronjob/scheduled-task` | `* * * * *` UTC | Existing SendGrid outbox processor |
| `migrate` | One-off operator-controlled migration job | Only before promotion | `prisma migrate deploy`, never a long-lived service |

The web and scheduled tasks use the **same PostgreSQL schema**. Database
connections must come from OpenChoreo environment configuration/secret
management (a PostgreSQL resource output or an existing, separately backed-up
database). Images are not configured with hard-coded credentials.

This is one Next.js app plus operational jobs, **not** an invented microservices
architecture. The existing Netlify functions remain supported.

## Build four separate images

Use a reviewed source commit or immutable tag. In the example, supply your own
registry and replace `TAG` with the same unique version for all images:

```sh
export TAG=staging-20261104
docker build --target production -t ghcr.io/YOUR_ORG/freshpick-web:$TAG .
docker build --target recurring  -t ghcr.io/YOUR_ORG/freshpick-recurring:$TAG .
docker build --target outbox     -t ghcr.io/YOUR_ORG/freshpick-outbox:$TAG .
docker build --target migrate    -t ghcr.io/YOUR_ORG/freshpick-migrate:$TAG .
```

The default `docker build .` still produces the web image. The separate
migration target includes the Prisma CLI; neither the web nor workers run schema
migrations on every pod start. The job images bundle the existing application
domain services through esbuild, and use the generated Prisma client.

Never pass production database credentials as Docker build arguments. For local
staging smoke tests, use an untracked env file and a disposable PostgreSQL
database, never live customer data:

```sh
# Only against a backed-up, reviewed staging database
docker run --rm --env-file .env.staging ghcr.io/YOUR_ORG/freshpick-migrate:$TAG
```

Also run `npm run check:production` in an appropriately configured environment
to validate configuration and required migrations. Review pending migration
SQL before applying it. A schema backup and successful restore test are required
before production changes.

## Configure in OpenChoreo

1. Create a FreshPick project and its staging environment, with a PostgreSQL
   resource or existing PostgreSQL service. Never connect the demo directly to
   the live Netlify database.
2. Create a web-application component from the `freshpick-web` image, exposed
   on port 3000 with `/api/healthz` as readiness path. The Next.js app contains
   its own API handlers and does not need a separate API component.
3. Create two `scheduled-task` components from the respective recurring/outbox
   images. Set the UTC schedules from the table above. Use `Forbid` concurrency
   policy to avoid overlapping executions of the *same* task.
4. Provide `DATABASE_URL`, `JWT_SECRET`, approved delivery pricing
   (`DELIVERY_FEE_LKR` etc.), `FRONTEND_URL`, and necessary identity settings
   to the web component. Provide `DATABASE_URL` to both scheduled jobs and
   `SENDGRID_API_KEY`/`SENDGRID_FROM_EMAIL` to the outbox job. Configure other
   variables used by mail templates and delivery policy per
   [operations guide](../../docs/OPERATIONS.md). Inject credentials through
   secret management, not through Git or image layers.
5. Configure `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or
   `SUPABASE_SERVICE_ROLE_KEY`) and optionally `SUPABASE_STORAGE_BUCKET`
   for product/category/blog images. These remain outside pod filesystems.
   Supplier catalogue file bytes are stored in PostgreSQL in hosted production
   modes. Verify retention, backup, restore and any previously uploaded
   filesystem-backed records before rollout.
6. Back up the intended database and perform the one-off migration **before**
   deploying or promoting the web and scheduled-task components. Confirm
   `/api/healthz` returns HTTP 200 and no sensitive fields.
7. When moving processing from Netlify to OpenChoreo, **disable the Netlify
   scheduled functions for that database**. Running both schedulers against
   the same database is operationally unsafe, even if individual paths use
   idempotency and row claims.

## Staging acceptance checklist

- [ ] The `production` image starts and `GET /api/healthz` responds 200 when
      migrations are applied; returns 503 when PostgreSQL is unavailable.
- [ ] Sign in as an isolated staging account, browse products, place a COD
      order, and verify status/stock updates. No real payments.
- [ ] Upload an image through the protected API and verify its Supabase URL
      still works after the pod restarts. Missing Supabase credentials must
      return a safe error, never silently fall back to pod disk.
- [ ] Upload and approve a supplier CSV/XLSX file; verify import/download still
      works after the web pod restarts, including for multiple replicas.
- [ ] Create an isolated due subscription; run the recurring task and inspect
      delivery record, stock claim and logs. Repeat without duplicate delivery.
- [ ] Create a staging outbox entry with an approved, test-only recipient;
      trigger the outbox task and verify provider delivery/retry behavior.
- [ ] Verify one-off migration success, then run it a second time against
      staging to confirm it is a no-op; separately verify failed migrations
      block promotion.
- [ ] Inspect OpenChoreo build/deployment logs and CronJob history; configure
      retries, timeout, backlog alerts, backups, and resource limits.
- [ ] Confirm no live Netlify scheduled jobs target the same database.
- [ ] Check permissions for admin/supplier APIs and verify production auth
      and security readiness before exposing customer data.

No production deployment or acceptance test is implied by this repository
guide. External credentials and actual cluster verification are required.
