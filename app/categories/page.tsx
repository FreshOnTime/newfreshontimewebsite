"use client";
import { PageContainer } from "@/components/templates/PageContainer";
import SectionHeader from "@/components/home/SectionHeader";
import Link from "next/link";
import { useLocalStorageCache, CACHE_TTL } from "@/lib/hooks/useLocalStorageCache";

type Cat = { name: string; slug: string };

export default function CategoriesIndex() {
  const { data: cats, isLoading } = useLocalStorageCache<Cat[]>(
    "categories_list",
    async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) return [];
      const json = await res.json();
      const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
      return items
        .map((c) => {
          if (typeof c === 'object' && c && 'name' in c && 'slug' in c) {
            const cc = c as { name?: unknown; slug?: unknown };
            return { name: String(cc.name ?? ''), slug: String(cc.slug ?? '') };
          }
          return { name: '', slug: '' };
        })
        .filter((c) => c.name && c.slug);
    },
    { ttl: CACHE_TTL.LONG }
  );

  const categories = cats || [];

  return (
    <PageContainer>
      <SectionHeader title="Categories" subtitle="Browse by aisle" />
      {isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="border rounded-lg p-4 bg-gray-100 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="border rounded-lg p-4 bg-white dark:bg-card hover:bg-primary hover:text-primary-foreground"
            >
              {c.name}
            </Link>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No categories yet.</div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
