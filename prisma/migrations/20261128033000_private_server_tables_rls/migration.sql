-- These application tables are accessed through authenticated server-side Prisma
-- endpoints. Do not expose their contents via the Supabase Data API.
-- Role checks keep this migration portable to isolated PostgreSQL CI databases.
DO $private_tables$
DECLARE
  table_name text;
  api_role text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    '_prisma_migrations', 'agent_access_tokens', 'business_leads',
    'checkout_requests', 'contact_enquiries', 'email_outbox',
    'notification_reads', 'oauth_identities', 'subscription_plan_claims',
    'subscription_requests'
  ] LOOP
    IF table_name = '_prisma_migrations' AND to_regclass('public._prisma_migrations') IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC', table_name);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=api_role) THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I',table_name,api_role);
      END IF;
    END LOOP;
  END LOOP;
END
$private_tables$;
