"use client";
import { PageContainer } from "@/components/templates/PageContainer";
import SectionHeader from "@/components/home/SectionHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

type Cat = { name: string; slug: string };

export default function CategoriesIndex() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const json = await res.json();
        const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
        const mapped: Cat[] = items
          .map((c) => {
            if (typeof c === 'object' && c && 'name' in c && 'slug' in c) {
              const cc = c as { name?: unknown; slug?: unknown };
              return { name: String(cc.name ?? ''), slug: String(cc.slug ?? '') };
            }
            return { name: '', slug: '' };
          })
          .filter((c) => c.name && c.slug);
        if (!ignore) setCats(mapped);
      } catch {
        // ignore
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  return (
    <PageContainer>
      <SectionHeader title="Categories" subtitle="Browse by aisle" />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="border rounded-lg p-4 bg-white dark:bg-card hover:bg-primary hover:text-primary-foreground"
          >
            {c.name}
          </Link>
        ))}
        {cats.length === 0 && (
          <div className="col-span-full text-center text-gray-500">No categories yet.</div>
        )}
      </div>
    </PageContainer>
  );
}
