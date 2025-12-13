import Link from "next/link";
import Image from "next/image"; // Added
import { ArrowRight } from "lucide-react"; // Added
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
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
    <>
      <PremiumPageHeader
        title="Our Collections"
        subtitle="Browse our carefully curated aisles to find exactly what you need."
        backgroundImage="https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2574&auto=format&fit=crop"
      />
      <div className="container mx-auto px-4 md:px-8 pb-20">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-3xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-zinc-100"
              >
                {/* Fallback pattern if no specific image is available (since basic cat list usually lacks images without extra fetch) */}
                {/* Ideally we would fetch images here, but for now we use a nice gradient/pattern or a placeholder if available */}
                <div className="absolute inset-0 bg-zinc-200">
                  <Image
                    src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2670&auto=format&fit=crop"
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <span className="w-12 h-1 bg-white/30 rounded-full mb-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  <h3 className="text-3xl font-serif font-bold text-white mb-2">{c.name}</h3>
                  <div className="inline-flex items-center text-sm font-medium text-white/80 uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    View Collection <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-zinc-400 font-serif">No categories found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
