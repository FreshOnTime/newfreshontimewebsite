# Customer and producer enquiry inbox

Updated 2026-10-03.

## Customer journey

Our Producers → Ask a question opens `/contact?type=question&source=producers`, with Question selected and Selling with FreshPick prefilled as the subject. The general Contact page and existing Issue/Suggestion links use the same form.

Submitting saves a `ContactEnquiry` in PostgreSQL through `POST /api/contact`. The old endpoint only logged a message and returned success; it now reports success only after persistence. A customer sees an `FP-...` reference after the save. This response contains the enquiry ID only, never private notes or another person's contact details.

Name, email, subject, message, enquiry type, priority, optional order reference and source are validated on the client and server. Message length is capped at 5,000 characters. The server controls initial New status and empty admin notes. Sources are descriptive form context, not verified producer identity or authorization.

Failed requests retain the form values. The browser reuses a UUID submission ID when retrying unchanged content; a unique database constraint prevents duplicate rows after a lost successful response. Changing the content generates a new ID. Older clients without an ID still work, but do not have this retry deduplication. The ID is kept for the current mounted form, not persisted across browser reloads.

Public submissions have a six-request-per-ten-minute IP limit using the existing in-memory limiter. This is per worker, not a deployment-wide spam-control service. No submission-body logging or automatic enquiry emails are used.

## Admin workflow

Open **Enquiry inbox** from the admin sidebar or dashboard. `/admin/enquiries` loads a private, paginated list through `GET /api/admin/enquiries`.

- Search by name, email, subject, message, order reference or the displayed FP reference.
- Filter by New/In progress/Resolved, source or enquiry type.
- View contact details, the customer's full message and optional order reference.
- Update status and record private admin notes, then choose Save enquiry.
- Refresh or retry loading when requests fail. Results contain 20 records per page.

The admin's email link opens their email application for manual follow-up; the enquiry submission itself is stored in the dashboard. Saving notes or status does not send a reply. This is an internal work queue, not a two-way customer chat service.

Both listing and updating require the existing server-side admin guard, which checks an access token and the current, non-banned account's role. Guests and customers cannot read or alter enquiries. Responses use `Cache-Control: private, no-store`; the admin route inherits private/noindex metadata. The existing admin interface requires a primary admin role even though its API guard also recognizes secondary admin access.

Each record has an integer version. A save matches the current version and increments it atomically. Stale edits return 409 instead of overwriting another administrator's notes or status. Refresh to load the current record before saving again. Missing enquiries return 404. Errors keep draft notes visible until a refresh or successful save.

## Storage and deployment

| Component | Location |
| --- | --- |
| Public form | `app/contact/page.tsx` |
| Validated persistence | `app/api/contact/route.ts` |
| Shared types and validation | `lib/contactEnquiries.ts` |
| Protected inbox API | `app/api/admin/enquiries/route.ts` |
| Admin interface | `app/admin/enquiries/page.tsx` |
| Model | `ContactEnquiry` in `prisma/schema.prisma` |
| Migration | `prisma/migrations/20261003040000_contact_enquiries/migration.sql` |

Apply `npm run db:migrate` against the intended PostgreSQL database **before** deploying the new app. The migration adds `contact_enquiries`, the unique submission ID, source/status date indexes and constraints for the allowed status/type/source/priority values. No existing records are migrated or deleted. Old contact submissions were not saved by the previous endpoint and cannot be recovered from this feature.

After deployment, submit a small test question, confirm its reference, find it in the admin inbox, save private notes and change its status. Verify guest access is denied and agree a team process for checking and following up on enquiries. The migration has been compared with Prisma's generated schema diff; this local verification does not apply it to production.

## Verification

- Production build, TypeScript and ESLint checks passed.
- All 218 unit/API tests in 27 suites passed, including 30 enquiry API tests.
- Prisma schema validation passed. Migration columns/defaults/indexes match Prisma’s generated schema diff; four additional allowed-value CHECK constraints were reviewed.
- Twenty browser layout checks passed across Contact, producer-context Contact, Our Producers and the admin inbox at 320, 390, 820, 1280 and 1440 pixels, with no horizontal overflow.
- Nine browser flows passed: producer context, a lost-response retry, denied guest reads/updates, protected inbox retrieval, persisted notes/status after reload, stale-edit rejection, filters, pagination and failed-load recovery. No page errors occurred.

Local browser/API fixtures exercise the application routes and admin guard with in-memory Prisma records. They isolate verification from production customer data and email integrations. A real PostgreSQL migration and concurrent database execution were not tested here; apply the migration and perform the deployment acceptance check above against the intended environment.
