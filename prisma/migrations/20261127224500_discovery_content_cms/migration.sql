CREATE TABLE "discovery_content" (
 "id" TEXT NOT NULL PRIMARY KEY, "kind" TEXT NOT NULL, "slug" TEXT NOT NULL,
 "title" TEXT NOT NULL, "category" TEXT NOT NULL, "summary" TEXT NOT NULL, "body" TEXT NOT NULL,
 "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "variations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "relatedDishes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "searchTerm" TEXT NOT NULL DEFAULT '', "sourceUrl" TEXT NOT NULL DEFAULT '', "sourceName" TEXT NOT NULL DEFAULT '',
 "location" TEXT NOT NULL DEFAULT '', "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3),
 "published" BOOLEAN NOT NULL DEFAULT false, "publishedAt" TIMESTAMP(3), "updatedBy" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "discovery_content_kind_check" CHECK ("kind" IN ('dish','tradition','event')),
 CONSTRAINT "discovery_content_event_dates_check" CHECK (("kind" = 'event' AND ("startsAt" IS NULL OR "endsAt" IS NULL OR "endsAt" > "startsAt")) OR ("kind" <> 'event' AND "startsAt" IS NULL AND "endsAt" IS NULL)),
 CONSTRAINT "discovery_content_publish_check" CHECK (NOT "published" OR ("publishedAt" IS NOT NULL AND length(trim("sourceUrl")) > 0 AND length(trim("sourceName")) > 0 AND ("kind" <> 'event' OR ("startsAt" IS NOT NULL AND "endsAt" IS NOT NULL AND length(trim("location")) > 0))))
);
CREATE UNIQUE INDEX "discovery_content_kind_slug_key" ON "discovery_content"("kind","slug");
CREATE INDEX "discovery_content_kind_published_startsAt_idx" ON "discovery_content"("kind","published","startsAt");
ALTER TABLE "discovery_content" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "discovery_content" FROM PUBLIC;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON TABLE "discovery_content" FROM anon'; END IF; IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON TABLE "discovery_content" FROM authenticated'; END IF; END $$;
INSERT INTO "discovery_content" ("id","kind","slug","title","category","summary","body","aliases","variations","searchTerm","sourceUrl","sourceName","published","publishedAt","updatedAt") VALUES
('atlas-kottu', 'dish', 'kottu', 'Kottu', 'Street food', 'Chopped flatbread cooked on a hot griddle with vegetables and other additions.', 'The rhythmic chopping is part of the experience. Chicken, egg, vegetable and cheese versions are common; ingredients differ by kitchen. Ask about sauces, meat and allergens before ordering.', ARRAY['kottu roti','kotthu','koththu','කොත්තු','கொத்து']::TEXT[], ARRAY['Chicken kottu','Vegetable kottu','Cheese kottu']::TEXT[], 'kottu', 'https://www.tasteatlas.com/kottu', 'TasteAtlas — Kottu', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('atlas-hoppers', 'dish', 'hoppers', 'Hoppers (appa)', 'Breakfast & dinner', 'Bowl-shaped pancakes with a crisp rim and soft centre, typically made from fermented rice batter and coconut milk.', 'Plain and egg hoppers are often served with savoury accompaniments. Try them fresh from the pan; check the kitchen’s ingredients if you have dietary restrictions.', ARRAY['appa','appam','egg hopper','ආප්ප','ஆப்பம்']::TEXT[], ARRAY['Plain hoppers','Egg hoppers']::TEXT[], 'hopper', 'https://exploresrilanka.lk/a-real-taste-of-sri-lanka-the-traditional-sri-lankan-breakfast/', 'Explore Sri Lanka — Traditional breakfast', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('atlas-string-hoppers', 'dish', 'string-hoppers', 'String hoppers (indi appa)', 'Breakfast & dinner', 'Fine strands of rice-flour dough pressed into small nests and steamed.', 'Typically eaten with curry, coconut sambol or coconut gravy. The strands and texture distinguish them from bowl-shaped hoppers. Accompaniments vary by household and venue.', ARRAY['idi appa','idiyappam','indiappa','ඉඳිආප්ප','இடியாப்பம்']::TEXT[], ARRAY['String hoppers with curry','String hoppers with kiri hodi']::TEXT[], 'string hopper', 'https://exploresrilanka.lk/a-real-taste-of-sri-lanka-the-traditional-sri-lankan-breakfast/', 'Explore Sri Lanka — Traditional breakfast', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('atlas-kiribath', 'dish', 'kiribath', 'Kiribath (milk rice)', 'Food culture', 'Rice cooked with coconut milk, often cut into pieces and served at celebrations.', 'Kiribath has an important place in Sri Lankan festive meals and special occasions. It can be accompanied by spicy onion relish. Traditions and serving styles vary.', ARRAY['milk rice','kiri bath','කිරිබත්','பால் சோறு']::TEXT[], ARRAY['Kiribath with lunu miris']::TEXT[], 'kiribath', 'https://www.destinationsrilanka.travel/food-in-sri-lanka/', 'Destination Sri Lanka — Food in Sri Lanka', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("kind","slug") DO NOTHING;
