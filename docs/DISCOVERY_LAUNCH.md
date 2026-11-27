# FreshPick discovery launch

## Migration and seed
1. Back up the database and test on a staging database. The existing Prisma datasource uses DATABASE_URL; use a direct or session-mode PostgreSQL connection for migrations, not the transaction pooler. Do not commit secrets.
2. Run `npx prisma migrate status` then `npx prisma migrate deploy` and `npx prisma generate`.
3. Run `psql "$SEED_DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/seeds/freshpick-discovery.sql` with a direct/session URI (without Prisma-only query parameters), or paste the seed in the Supabase SQL editor after migration.
4. Verify `SELECT "reviewStatus", count(*) FROM "discovery_prospects" GROUP BY 1;`. On an empty table 47 pending and zero approved are expected. Re-running the seed never overwrites reviewed rows.
5. Open /admin/discovery-prospects with an admin account. Check each source, verify current facts and permission, write notes, approve only eligible records. Reject or return to review to remove from public results.
6. The table has RLS and revoked grants for browser roles. The server must use an authorized database role (typically the existing Prisma database owner); do not expose a service credential or add anonymous access policies.

## Design and routes
Original wordmark and existing editorial images retained. Split magazine hero, serif typography, original green and amber accents, six-category Lucide rail, editorial chapters, responsive discovery directories, public reviewed profiles, two client-side calculators, and business landing page. Existing maker accounts, publishing, stories and item detail routes remain intact. Legacy /products still redirects to makers; /food-products is the new discovery route.

## Safety boundaries
The 47 prospects are research leads, not verified active vendors, supplier accounts, partner endorsements or owner-submitted products. Unconfirmed social page names are not converted into links; no copied imagery, invented prices, menus or phone numbers. The review screen cannot perform field correction yet; a trusted database administrator must correct inaccurate data before approval. For the MVP, claim/correction requests use the existing contact page. No external scraping or vendor messages have been executed.

## Acceptance checks
- Run `npx prisma validate`, `npx prisma generate`, `npx tsc --noEmit`, `npm run build` and relevant Jest tests.
- On staging with no approved prospects, public discovery should show an honest empty state; existing maker listings remain visible. Non-admin GET/PATCH must fail. Approval requires explicit confirmation and notes. Returning to pending/rejected removes the profile from public listings and direct URL.
- Seed twice and verify stable 47 rows and unchanged review status.
- At 320, 768, 1440px check hero, navigation, filters, cards and keyboard focus. Verify links and image licenses. Check calculators against hand-calculated values including zero and empty inputs.
- No production migration or deployment until staging and visual review pass.

## Design rationale and CI
The uploaded magazine spread is the visual reference for the split hero, generous breathing room, serif display type and photographic counterpart. Use the existing outlined logo, not a recreated logo. The design also follows the public frontend-design guidance at https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md: deliberate hierarchy, subject-specific layout and a restrained interaction system rather than generic gradients or repeated decorative cards. The CI workflow now imports the seed twice and checks the publication constraint; the visual-review script targets the new homepage and discovery routes at 390 and 1440 pixels. These checks are configured, not claimed to have passed.
