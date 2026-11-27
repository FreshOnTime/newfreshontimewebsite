# Release notes: discovery workspaces and authentication

Admin overview uses live database counts for published profiles, offerings, reviewed listings, content and review queues. Unavailable metrics render as unavailable, not fabricated zeros. Legacy administration is retained but moved below current workflows. Member saved picks remain browser-local.

Production evidence: six application accounts, zero linked Supabase identities; five legacy password hashes. A reset and a confirmation email were queued with zero attempts. The Vercel project had public Supabase URL/key names and SendGrid keys, but not the Supabase Auth opt-in flag. No provider secrets were read or changed.

The application now attempts delivery of only the new legacy authentication email in the request, retaining the existing atomic claim and retry queue. Expired links are not sent. This is a compatibility repair; Supabase is the desired long-term provider. Do not switch on the flag until the exact production project is configured and verified.

1. Authentication > URL configuration: Site URL https://www.freshpick.lk; exact redirects https://www.freshpick.lk/auth/reset-password and https://www.freshpick.lk/auth/verify. Confirm signup template: {{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}. Recovery template: {{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}.
2. Configure a verified SMTP sender in Supabase and verify real delivery to a dedicated test inbox. No credentials in Git or client bundle. The connected Supabase API does not expose Auth settings mutation; inspect the dashboard directly.
3. Stage the opt-in flag and provider config; verify signup, confirmation, login, reset, expiry, refresh and logout, then use the existing approved single-account migration process for eligible verified non-admin users. Never link by email alone. Preserve existing admin accounts until MFA migration is ready.
4. Verify the admin auth-delivery metrics and production runtime after deployment. Do not resend already expired reset/verification emails. Request fresh links.

Atlas: licensed Wikimedia Commons photographs for Kottu, Hoppers and String hoppers, visible credit, original source and CC BY-SA 3.0 links on details. Remote assets may be unavailable; no fake food photo is substituted. Kiribath is omitted from the default showcase and unfiltered Atlas but retained for existing links and explicit search; do not delete cultural CMS content without a separate decision. No migration introduced by these changes.
