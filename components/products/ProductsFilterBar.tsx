"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type FilterCategory = { _id: string; name: string };
const FILTER_CATEGORIES_CACHE_KEY = "freshpick_filter_categories_v2";
const FILTER_CATEGORIES_CACHE_TTL = 60 * 60 * 1000;

function readCachedFilterCategories(): FilterCategory[] | null {
  try {
    const raw = localStorage.getItem(FILTER_CATEGORIES_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { timestamp?: unknown; categories?: unknown };
    if (
      typeof cached.timestamp !== "number" ||
      Date.now() - cached.timestamp > FILTER_CATEGORIES_CACHE_TTL ||
      !Array.isArray(cached.categories)
    ) {
      localStorage.removeItem(FILTER_CATEGORIES_CACHE_KEY);
      return null;
    }
    return cached.categories.filter(
      (category): category is FilterCategory =>
        Boolean(category) &&
        typeof category._id === "string" &&
        typeof category.name === "string"
    );
  } catch {
    return null;
  }
}

export default function ProductsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("search") || "");
  const [categoryId, setCategoryId] = useState(params.get("categoryId") || "");
  const [minPrice, setMinPrice] = useState(Number(params.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(params.get("maxPrice")) || 5000);
  const [inStock, setInStock] = useState(params.get("inStock") === "true");
  const [sort, setSort] = useState(params.get("sort") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(params.get("tags")?.split(",").filter(Boolean) || []);
  const [categories, setCategories] = useState<FilterCategory[]>([]);

  const filterTags = ["Organic", "Gluten-Free", "Vegan", "Keto", "Halal", "Local", "Imported"];

  useEffect(() => {
    setSearch(params.get("search") || "");
    setCategoryId(params.get("categoryId") || "");
    setMinPrice(Number(params.get("minPrice")) || 0);
    setMaxPrice(Number(params.get("maxPrice")) || 5000);
    setInStock(params.get("inStock") === "true");
    setSort(params.get("sort") || "");
    setSelectedTags(params.get("tags")?.split(",").filter(Boolean) || []);
  }, [params]);

  useEffect(() => {
    const cached = readCachedFilterCategories();
    if (cached) {
      setCategories(cached);
      return;
    }

    apiFetch("/api/categories")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const source: unknown = payload?.data ?? payload;
        if (!Array.isArray(source)) return;

        const nextCategories = source
          .map((item): FilterCategory | null => {
            if (!item || typeof item !== "object") return null;
            const category = item as { _id?: unknown; id?: unknown; name?: unknown; description?: unknown };
            const id = typeof category._id === "string" ? category._id : typeof category.id === "string" ? category.id : "";
            const name = typeof category.name === "string"
              ? category.name
              : typeof category.description === "string"
                ? category.description
                : "";
            return id && name ? { _id: id, name } : null;
          })
          .filter((category): category is FilterCategory => category !== null);

        setCategories(nextCategories);
        localStorage.setItem(
          FILTER_CATEGORIES_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), categories: nextCategories })
        );
      })
      .catch(() => undefined);
  }, []);

  const apply = useMemo(
    () => (overrides?: Partial<Record<string, string | null>>) => {
      const sp = new URLSearchParams(params.toString());
      const update = (key: string, value: string | null | undefined) => {
        if (value === null || value === "" || value === undefined) sp.delete(key);
        else sp.set(key, value);
      };

      update("search", overrides?.search !== undefined ? overrides.search : search);
      update("categoryId", overrides?.categoryId !== undefined ? overrides.categoryId : categoryId);
      update("minPrice", overrides?.minPrice !== undefined ? overrides.minPrice : (minPrice > 0 ? String(minPrice) : null));
      update("maxPrice", overrides?.maxPrice !== undefined ? overrides.maxPrice : (maxPrice < 5000 ? String(maxPrice) : null));
      update("inStock", overrides?.inStock !== undefined ? overrides.inStock : (inStock ? "true" : null));
      update("sort", overrides?.sort !== undefined ? overrides.sort : sort);
      update("tags", overrides?.tags !== undefined ? overrides.tags : (selectedTags.length ? selectedTags.join(",") : null));

      sp.delete("page");
      const next = sp.toString();
      router.push(next ? `${pathname}?${next}` : pathname);
    },
    [params, pathname, router, search, categoryId, minPrice, maxPrice, inStock, sort, selectedTags]
  );

  const toggleTag = (tag: string) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];
    setSelectedTags(nextTags);
    apply({ tags: nextTags.length ? nextTags.join(",") : null });
  };

  const clearAll = () => {
    setSearch("");
    setCategoryId("");
    setMinPrice(0);
    setMaxPrice(5000);
    setInStock(false);
    setSort("");
    setSelectedTags([]);
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    search || categoryId || minPrice > 0 || maxPrice < 5000 || inStock || selectedTags.length || sort
  );

  return (
    <div className="sticky top-[72px] z-30 rounded-[1.5rem] border border-zinc-200 bg-white/95 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row">
          <form
            className="relative min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              apply({ search });
            }}
          >
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              className="h-12 rounded-full border-zinc-200 bg-[#f7f8f6] pl-11 pr-11 text-sm shadow-none placeholder:text-zinc-400 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500"
              placeholder="Search groceries, meals, makers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  apply({ search: null });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          <Select
            value={categoryId || "all"}
            onValueChange={(value) => {
              const nextCategory = value === "all" ? "" : value;
              setCategoryId(nextCategory);
              apply({ categoryId: nextCategory || null });
            }}
          >
            <SelectTrigger className="h-12 w-full rounded-full border-zinc-200 bg-white px-5 shadow-none md:w-[190px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:justify-end xl:pb-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 shrink-0 rounded-full border-zinc-200 px-4 shadow-none hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 ${minPrice > 0 || maxPrice < 5000 ? "border-emerald-300 bg-emerald-50 text-emerald-800" : ""}`}
              >
                Price <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-2xl p-6" align="end">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-sm font-medium text-zinc-900">Price range</h4>
                  <span className="text-xs text-zinc-500">Rs. {minPrice} – {maxPrice === 5000 ? "5000+" : maxPrice}</span>
                </div>
                <Slider
                  value={[minPrice, maxPrice]}
                  max={5000}
                  step={100}
                  minStepsBetweenThumbs={1}
                  onValueChange={(values) => {
                    setMinPrice(values[0]);
                    setMaxPrice(values[1]);
                  }}
                  onValueCommit={(values) => apply({ minPrice: values[0] > 0 ? String(values[0]) : null, maxPrice: values[1] < 5000 ? String(values[1]) : null })}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 shrink-0 rounded-full border-zinc-200 px-4 shadow-none hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 ${selectedTags.length > 0 || inStock ? "border-emerald-300 bg-emerald-50 text-emerald-800" : ""}`}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                {(selectedTags.length > 0 || inStock) && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-800 px-1 text-[10px] text-white">
                    {selectedTags.length + (inStock ? 1 : 0)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 rounded-2xl p-4" align="end">
              <div className="space-y-2">
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Refine collection</p>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-zinc-50">
                  <Checkbox
                    checked={inStock}
                    onCheckedChange={(checked) => {
                      const value = checked === true;
                      setInStock(value);
                      apply({ inStock: value ? "true" : null });
                    }}
                  />
                  <span className="text-sm text-zinc-700">In stock only</span>
                </label>
                <div className="my-2 border-t border-zinc-100" />
                {filterTags.map((tag) => (
                  <label key={tag} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-zinc-50">
                    <Checkbox checked={selectedTags.includes(tag)} onCheckedChange={() => toggleTag(tag)} />
                    <span className="text-sm text-zinc-600">{tag}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Select
            value={sort || "newest"}
            onValueChange={(value) => {
              const nextSort = value === "newest" ? "" : value;
              setSort(nextSort);
              apply({ sort: nextSort || null });
            }}
          >
            <SelectTrigger className="h-11 w-[150px] shrink-0 rounded-full border-zinc-200 bg-white px-4 shadow-none">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="newest">Fresh arrivals</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="h-11 shrink-0 rounded-full px-4 text-xs text-zinc-500 hover:bg-red-50 hover:text-red-600"
              onClick={clearAll}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
