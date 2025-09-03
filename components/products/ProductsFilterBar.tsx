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
      .catch(() => {});
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
    <div className="mb-4 rounded-lg border bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
        <div className="md:col-span-4">
          <label className="block text-xs text-gray-600 mb-1">Search</label>
          <div className="flex gap-2">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") apply(); }}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Category</label>
          <Select
            value={categoryId || "all"}
            onValueChange={(v) => {
              if (v === "all") {
                setCategoryId("");
                apply({ categoryId: "" });
              } else {
                setCategoryId(v);
                apply({ categoryId: v });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Min price</label>
          <Input
            inputMode="numeric"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9.]/g, ""))}
            onBlur={() => apply()}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Max price</label>
          <Input
            inputMode="numeric"
            placeholder="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9.]/g, ""))}
            onBlur={() => apply()}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Sort</label>
          <Select
            value={sort || "relevance"}
            onValueChange={(v) => {
              if (v === "relevance") {
                setSort("");
                apply({ sort: "" });
              } else {
                setSort(v);
                apply({ sort: v });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <Checkbox id="inStock" checked={inStock} onCheckedChange={(v) => { const b = Boolean(v); setInStock(b); apply({ inStock: b ? "true" : "" }); }} />
          <label htmlFor="inStock" className="text-sm">In stock only</label>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-2 rounded-md border text-sm"
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
          Reset filters
        </button>
        <button
          className="px-3 py-2 rounded-md bg-green-600 text-white text-sm"
          onClick={() => apply()}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
