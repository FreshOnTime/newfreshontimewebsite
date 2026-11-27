ALTER TABLE "discovery_content" DROP CONSTRAINT "discovery_content_kind_check";
ALTER TABLE "discovery_content" ADD CONSTRAINT "discovery_content_kind_check" CHECK ("kind" IN ('dish','tradition','event','guide'));
CREATE TABLE "site_page_content" (
 "key" TEXT PRIMARY KEY, "draft" JSONB NOT NULL, "live" JSONB NOT NULL,
 "updatedBy" TEXT, "updatedAt" TIMESTAMP(3) NOT NULL, "publishedAt" TIMESTAMP(3)
);
ALTER TABLE "site_page_content" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "site_page_content" FROM PUBLIC;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON TABLE "site_page_content" FROM anon'; END IF; IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON TABLE "site_page_content" FROM authenticated'; END IF; END $$;
