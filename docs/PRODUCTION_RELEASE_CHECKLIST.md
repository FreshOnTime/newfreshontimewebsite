# Production release checklist

FreshPick uses a Next.js build on Vercel and the checked-in Prisma migrations on Supabase PostgreSQL. A READY Vercel deployment does not prove that the production schema is ready.

## Before merging a schema-changing PR

1. Review the migration SQL, and verify the exact PR head passes CI and visual review with an isolated PostgreSQL instance.
2. Verify the production database identity against the intended Supabase project. Confirm a recoverable backup and inspect existing migration history; never reset the production database.
3. Apply only reviewed backward-compatible migrations before releasing the dependent application. Use a trusted terminal with the direct/session PostgreSQL connection in `DATABASE_URL`; do not paste or print credentials.

```sh
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
```

If SQL was applied outside Prisma, verify the actual schema before reconciling with the original migration using `prisma migrate resolve --applied <migration-name>`. Do not mark failed or partially applied migrations as complete. Never modify already-applied migration files.

4. Confirm the new deployment is READY, attached to the production domain, and serves the intended commit. Review the last release before rolling back; database rollback is not automatic.
5. Check production HTTP responses for /, /discover, /makers, /gifting, /join, /stories, /food-atlas/kottu and /sitemap.xml. Check expected page content too, because Next.js may stream an error with a 200 response. Inspect production logs for P2021, P2022, unexpected 5xx and database connection failures.
6. Test registration, approval, editing, publishing and unpublishing with a dedicated non-public staging/fixture account. Do not publish dummy production business listings.
7. Record the deployment commit and applied migration names. Batch feature changes and avoid repeatedly pushing intermediate commits to Vercel.

## Current baseline

PR #177 introduces business specialities. The production baseline was reconciled to 25 successful Prisma migrations and no unresolved failures. The business publishing experience PR does not introduce database schema changes. Its CI and browser workflows must still pass before merging.

Automatic production migration execution requires a deliberately configured protected release environment and verified database credentials. This checklist does not turn on automatic production SQL or change Vercel billing.
