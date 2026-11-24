# FreshPick authentication: proposed Supabase Auth migration

## Immediate UI change
Remove Google sign-in from the login form. Keep existing email/phone/password sign-in and recovery; show existing Google-only users the password setup route. Keep the legacy backend and Firebase code temporarily for compatibility; this does not disable the Google API or migrate identities. Before production rollout, verify reset delivery for an existing Google-only test account.

## Proposed architecture (not yet implemented)
Supabase Auth owns credential verification, email verification, recovery, sessions and MFA. Next.js uses @supabase/supabase-js and @supabase/ssr for authenticated server requests and cookie refresh. Prisma remains the business-data layer; add a unique nullable Supabase Auth subject mapping to the existing application user, preserving its ID, roles, bans, supplier relationship and dependent data. Roles must come from the server-controlled application database, not editable auth user metadata. Verify all server authorization paths, including middleware, protected API routes and admin/maker ownership. Keep MCP OAuth and agent token contracts separate; audit their account binding and revocation.

## Migration order
1. Audit existing users: verified vs unverified email, phone-only, Google-only, bcrypt password accounts, administrators. Never auto-confirm unverified identifiers. Determine recovery process for phone-only accounts before enforcing email.
2. Configure a nonproduction Supabase project, site URL, redirect allowlist, branded templates, custom SMTP, rate limits and secret management. Do not copy production credentials into CI.
3. Import supported bcrypt hashes with the Auth admin API and establish the unique app-user mapping; preserve IDs, validate representative hashes, and use verified-email recovery for Google-only users. Handle collisions explicitly. Do not migrate or store plaintext passwords.
4. Implement sign-up, verification, sign-in, callback/recovery, password update, refresh and sign-out. Require verified email for new users; collect WhatsApp/contact phone during maker onboarding. Maintain legacy login during controlled transition for users without email.
5. Test protected routes, password recovery and session revocation, banned users, admin permissions, maker ownership, email changes and MCP integration. Confirm real SMTP delivery, redirect restrictions and rollback procedures. Add MFA for admins and RLS policies for any tables exposed through Supabase APIs; Prisma server-side authorization still required.
6. Only after successful migration and verification, retire Firebase sign-in, custom JWT/password storage and token tables in a separate reviewed change. Do not delete historical OAuth identity data or revoke all user sessions without a migration plan.

References: https://supabase.com/docs/guides/auth/passwords ; https://supabase.com/docs/guides/auth/auth-smtp ; https://supabase.com/docs/guides/auth/server-side/creating-a-client ; https://supabase.com/kb/guides/migrate-from-auth0 (supported bcrypt hash import).
