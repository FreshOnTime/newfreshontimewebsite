# FreshPick booking roadmap (not implemented)
Today: official contact links, direct restaurant enquiries, gift brief planner. The homepage shows independent editorial references and existing approved profiles separately. No live availability is claimed. Editorial entries use original brief factual descriptions and official website links; no third-party images or reviews. Sources are in lib/editorialDiscoveries.ts (checked 2026-11-27). Do not import as approved supplier accounts.

## Phase 1: reservation requests
Opt-in, verified restaurant accounts only. Business Studio configures party size limits, opening hours, booking lead time, blackout dates and capacity by slot. Customer selects date, local time and party size, shares contact details with consent and sends a request. A pending request is not a booking. Venue accepts/declines; user receives confirmation or alternative. Support cancellation, expiry, audit log and abuse limits.

## Phase 2: calendar
Native calendar is the authoritative booking inventory. Store UTC instants and venue timezone (Asia/Colombo default), calculate overlaps in transactions with capacity locks, unique idempotency keys and concurrent-booking tests. Show daily/weekly calendar in Business Studio. Optional Google Calendar integration via scoped OAuth; export confirmed bookings as ICS and reconcile events. External free/busy is not a substitute for table capacity.

## Phase 3: optional monetization
Per confirmed referral or monthly booking tools subscription after measuring adoption. No payment handling initially. Measure request-to-confirmed conversion and cancellations, and only count confirmed reservations. Maker appointments and tasting/workshop scheduling can reuse the booking module after separate capacity requirements are validated.

## Release criteria
Test timezones, simultaneous requests, access isolation, double-booking prevention, cancellation, reminders, expired requests, data deletion and calendar sync failures. Do not display a Book now control until restaurant availability and confirmation workflows are operational.
