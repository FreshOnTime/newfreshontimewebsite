"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";

export default function ProductsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // State
  const [search, setSearch] = useState<string>(params.get("search") || "");
  const [categoryId, setCategoryId] = useState<string>(params.get("categoryId") || "");
  const [minPrice, setMinPrice] = useState<number>(Number(params.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(params.get("maxPrice")) || 5000);
  const [inStock, setInStock] = useState<boolean>(params.get("inStock") === "true");
  const [sort, setSort] = useState<string>(params.get("sort") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(params.get("tags")?.split(",").filter(Boolean) || []);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);

  // Mock tags for now - typically these might come from an API
  const filterTags = ["Organic", "Gluten-Free", "Vegan", "Keto", "Halal", "Local", "Imported"];

  // Sync state
  useEffect(() => {
    setSearch(params.get("search") || "");
    setCategoryId(params.get("categoryId") || "");
    setMinPrice(Number(params.get("minPrice")) || 0);
    setMaxPrice(Number(params.get("maxPrice")) || 5000);
    setInStock(params.get("inStock") === "true");
    setSort(params.get("sort") || "");
    setSelectedTags(params.get("tags")?.split(",").filter(Boolean) || []);
  }, [params]);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j) => {
        const arr = j?.data ?? j;
        if (Array.isArray(arr)) {
          setCategories(arr.map((c: any) => ({ _id: c._id, name: c.name || c.description })).filter(c => c.name));
        }
      })
      .catch(() => { });
  }, []);

  const apply = useMemo(
    () => (overrides?: Partial<Record<string, string | null>>) => {
      const sp = new URLSearchParams(params.toString());
      const update = (k: string, v: string | null | undefined) => {
        if (v === null || v === "" || v === undefined) sp.delete(k); else sp.set(k, v);
      };

      update("search", overrides?.search !== undefined ? overrides.search : search);
      update("categoryId", overrides?.categoryId !== undefined ? overrides.categoryId : categoryId);
      update("minPrice", overrides?.minPrice !== undefined ? overrides.minPrice : (minPrice > 0 ? String(minPrice) : null));
      update("maxPrice", overrides?.maxPrice !== undefined ? overrides.maxPrice : (maxPrice < 5000 ? String(maxPrice) : null));
      update("inStock", overrides?.inStock !== undefined ? overrides.inStock : (inStock ? "true" : null));
      update("sort", overrides?.sort !== undefined ? overrides.sort : sort);

      const tagsToApply = overrides?.tags !== undefined ? overrides.tags : selectedTags.join(",");
      update("tags", tagsToApply || null);

      sp.delete("page");
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router, search, categoryId, minPrice, maxPrice, inStock, sort, selectedTags]
  );

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    apply({ tags: newTags.join(",") });
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

  const hasActiveFilters = categoryId || minPrice > 0 || maxPrice < 5000 || inStock || selectedTags.length > 0 || sort;

  return (
    <div className="mb-10 p-1 sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 border-b border-zinc-100 transition-all">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

        <div className="flex items-center gap-4 w-full lg:w-auto flex-1">
          {/* Search */}
          <div className="relative group w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
            <Input
              className="pl-11 bg-zinc-50 border-zinc-200 rounded-full h-11 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all placeholder:text-zinc-500 font-medium tracking-wide"
              placeholder="Search the collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") apply({ search }); }}
            />
          </div>

          {/* Category Dropdown */}
          <Select
            value={categoryId || "all"}
            onValueChange={(v) => {
              const val = v === "all" ? "" : v;
              setCategoryId(val);
              apply({ categoryId: val });
            }}
          >
            <SelectTrigger className="w-[160px] bg-white border-zinc-200 rounded-full h-11 px-5 shadow-sm hover:border-emerald-500 transition-colors hidden md:flex">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">

          {/* Price Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`rounded-full h-11 px-5 border-zinc-200 hover:border-emerald-500 hover:text-emerald-700 ${minPrice > 0 || maxPrice < 5000 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''}`}>
                <span className="mr-2">Price</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Price Range</h4>
                  <span className="text-xs text-zinc-500">LKR {minPrice} - {maxPrice === 5000 ? '5000+' : maxPrice}</span>
                </div>
                <Slider
                  defaultValue={[0, 5000]}
                  value={[minPrice, maxPrice]}
                  max={5000}
                  step={100}
                  minStepsBetweenThumbs={1}
                  onValueChange={(vals: number[]) => {
                    setMinPrice(vals[0]);
                    setMaxPrice(vals[1]);
                  }}
                  onValueCommit={(vals: number[]) => apply({ minPrice: String(vals[0]), maxPrice: String(vals[1]) })}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Diet/Tags Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`rounded-full h-11 px-5 border-zinc-200 hover:border-emerald-500 hover:text-emerald-700 ${selectedTags.length > 0 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''}`}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <span>Filters</span>
                {selectedTags.length > 0 && <span className="ml-1.5 bg-emerald-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{selectedTags.length}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-zinc-900 mb-2">Refine By</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-zinc-50 p-1.5 rounded-md transition-colors">
                    <Checkbox
                      checked={inStock}
                      onCheckedChange={(c) => {
                        const val = c === true;
                        setInStock(val);
                        apply({ inStock: val ? "true" : "" });
                      }}
                    />
                    <span className="text-sm font-medium text-zinc-700">In Stock High Priority</span>
                  </label>
                  {filterTags.map(tag => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer hover:bg-zinc-50 p-1.5 rounded-md transition-colors">
                      <Checkbox
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <span className="text-sm text-zinc-600">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Dropdown - Minimal */}
          <Select
            value={sort || "relevance"}
            onValueChange={(v) => {
              const val = v === "relevance" ? "" : v;
              setSort(val);
              apply({ sort: val });
            }}
          >
            <SelectTrigger className="w-[140px] border-none shadow-none text-zinc-500 hover:text-emerald-700 font-medium">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Fresh Arrivals</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-red-500 hover:bg-red-50 uppercase tracking-wider h-11 px-3"
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
