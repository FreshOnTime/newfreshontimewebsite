"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Minimal filter bar that controls URL search params for server fetching
export default function ProductsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState<string>(params.get("search") || "");
  const [categoryId, setCategoryId] = useState<string>(params.get("categoryId") || "");
  const [minPrice, setMinPrice] = useState<string>(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(params.get("maxPrice") || "");
  const [inStock, setInStock] = useState<boolean>(params.get("inStock") === "true");
  const [sort, setSort] = useState<string>(params.get("sort") || "");
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);

  // Keep local state in sync when URL changes (e.g., back/forward)
  useEffect(() => {
    setSearch(params.get("search") || "");
    setCategoryId(params.get("categoryId") || "");
    setMinPrice(params.get("minPrice") || "");
    setMaxPrice(params.get("maxPrice") || "");
    setInStock(params.get("inStock") === "true");
    setSort(params.get("sort") || "");
  }, [params]);

  useEffect(() => {
    // Fetch categories client-side (public endpoint)
    fetch("/api/categories")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j) => {
        const arr: unknown = j?.data ?? j;
        if (!Array.isArray(arr)) return;
        type Raw = { _id?: unknown; name?: unknown; description?: unknown };
        const mapped = (arr as Raw[])
          .map((c) => {
            const id = c && typeof c._id !== "undefined" ? String(c._id) : "";
            const nmSrc = typeof c.name === "string" && c.name.trim() ? c.name : typeof c.description === "string" ? c.description : "";
            const nm = String(nmSrc);
            return { _id: id, name: nm };
          })
          .filter((c) => c._id.length > 0 && c.name.length > 0);
        setCategories(mapped);
      })
      .catch(() => { });
  }, []);

  const apply = useMemo(
    () => (overrides?: Partial<Record<string, string | null>>) => {
      const sp = new URLSearchParams(params.toString());
      const commit = (k: string, v: string | null | undefined) => {
        if (v == null || v === "") sp.delete(k); else sp.set(k, v);
      };
      commit("search", overrides?.search ?? search);
      commit("categoryId", overrides?.categoryId ?? categoryId);
      commit("minPrice", overrides?.minPrice ?? minPrice);
      commit("maxPrice", overrides?.maxPrice ?? maxPrice);
      commit("inStock", overrides?.inStock ?? (inStock ? "true" : ""));
      commit("sort", overrides?.sort ?? sort);
      // Reset pagination on filter change
      sp.delete("page");
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router, search, categoryId, minPrice, maxPrice, inStock, sort]
  );

  return (
    <div className="mb-10 p-1">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        {/* Search */}
        <div className="w-full lg:w-96 relative group">
          <Input
            className="bg-white border-zinc-200 rounded-full px-6 py-6 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all placeholder:text-zinc-400 font-medium tracking-wide uppercase"
            placeholder="Search Collection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") apply(); }}
          />
          {/* Search Icon could go here if we had one, but keeping simple */}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
          {/* Category Dropdown */}
          <Select
            value={categoryId || "all"}
            onValueChange={(v) => {
              const val = v === "all" ? "" : v;
              setCategoryId(val);
              apply({ categoryId: val });
            }}
          >
            <SelectTrigger className="w-[180px] bg-white border-zinc-200 rounded-full h-11 px-6 shadow-sm hover:border-emerald-500 transition-colors">
              <SelectValue placeholder="CATEGORY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Every Aisle</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select
            value={sort || "relevance"}
            onValueChange={(v) => {
              const val = v === "relevance" ? "" : v;
              setSort(val);
              apply({ sort: val });
            }}
          >
            <SelectTrigger className="w-[180px] bg-white border-zinc-200 rounded-full h-11 px-6 shadow-sm hover:border-emerald-500 transition-colors">
              <SelectValue placeholder="SORT BY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Fresh Arrivals</SelectItem>
            </SelectContent>
          </Select>

          {/* In Stock Toggle */}
          <div
            className={`flex items-center gap-3 px-6 h-11 rounded-full border cursor-pointer transition-all ${inStock ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
            onClick={() => { const newVal = !inStock; setInStock(newVal); apply({ inStock: newVal ? "true" : "" }); }}
          >
            <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
            <span className="text-sm font-medium uppercase tracking-wide">In Stock</span>
          </div>

          {(search || categoryId || minPrice || maxPrice || inStock || sort) && (
            <button
              className="text-xs text-zinc-400 hover:text-emerald-600 uppercase tracking-widest font-medium transition-colors border-b border-transparent hover:border-emerald-600 pb-0.5 ml-2"
              onClick={() => {
                setSearch("");
                setCategoryId("");
                setMinPrice("");
                setMaxPrice("");
                setInStock(false);
                setSort("");
                apply({ search: "", categoryId: "", minPrice: "", maxPrice: "", inStock: "", sort: "" });
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Price filter - simplified/hidden or distinct row if needed. 
          For luxury, exact price range is less common than 'sort by price'. 
          Keeping simpler for now or can add a collapsible advanced filter. */}
    </div>
  );
}
