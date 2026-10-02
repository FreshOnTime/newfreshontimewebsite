"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { getPriceRange, updateProductFilters } from "@/lib/productFilters";

type Category = { _id: string; name: string };
const CACHE_KEY = "freshpick_filter_categories_v2";
const TAGS = ["Organic", "Gluten-Free", "Vegan", "Keto", "Halal", "Local", "Imported"];
const CONTROL = "h-11 rounded-lg border-border bg-background shadow-none focus:ring-brand-green";
const FILTER = CONTROL + " shrink-0 border px-3 text-sm font-medium hover:bg-secondary hover:text-brand-green";
const SELECTED = " border-brand-green bg-brand-green/5 text-brand-green";

function parseCategories(source: unknown): Category[] {
  if (!Array.isArray(source)) return [];
  return source.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const id = typeof item._id === "string" ? item._id : item.id;
    const name = typeof item.name === "string" ? item.name : item.description;
    return typeof id === "string" && typeof name === "string" ? [{ _id: id, name }] : [];
  });
}

export default function ProductsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const [search, setSearch] = useState(params.get("search") || "");
  const [prices, setPrices] = useState<[number, number]>(() => getPriceRange(new URLSearchParams(query)));
  const [categories, setCategories] = useState<Category[]>([]);
  const [pending, startTransition] = useTransition();
  const categoryId = params.get("categoryId") || "";
  const [tags, setTags] = useState<string[]>(() => params.get("tags")?.split(",").filter(Boolean) || []);
  const [inStock, setInStock] = useState(params.get("inStock") === "true");
  const priceActive = params.has("minPrice") || params.has("maxPrice");
  const refinementCount = tags.length + Number(inStock);
  const appliedRange = getPriceRange(new URLSearchParams(query));
  const sliderMaximum = Math.max(5000, ...appliedRange) + (params.has("maxPrice") && appliedRange[1] >= 5000 ? 100 : 0);

  useEffect(() => {
    setSearch(params.get("search") || "");
    setPrices(getPriceRange(new URLSearchParams(query)));
    setTags(params.get("tags")?.split(",").filter(Boolean) || []);
    setInStock(params.get("inStock") === "true");
  }, [params, query]);

  useEffect(() => {
    const controller = new AbortController();
    let cached = false;
    try {
      const data = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (data && typeof data.timestamp === "number" && Date.now() - data.timestamp < 3600000 && Array.isArray(data.categories)) {
        setCategories(parseCategories(data.categories));
        cached = true;
      }
    } catch { /* Storage is optional. */ }
    if (!cached) {
      apiFetch("/api/categories", { signal: controller.signal })
        .then((response) => response.ok ? response.json() : Promise.reject())
        .then((payload) => {
          if (controller.signal.aborted) return;
          const next = parseCategories(payload?.data ?? payload?.categories ?? payload);
          setCategories(next);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), categories: next })); }
          catch { /* Filtering works without persistent storage. */ }
        })
        .catch(() => undefined);
    }
    return () => controller.abort();
  }, []);

  const apply = (changes: Record<string, string | null>) => {
    const next = updateProductFilters(query, changes);
    startTransition(() => router.push(next ? pathname + "?" + next : pathname, { scroll: false }));
  };
  const chips: { label: string; changes: Record<string, string | null> }[] = [
    ...(params.get("search") ? [{ label: "Search: " + params.get("search"), changes: { search: null } }] : []),
    ...(categoryId ? [{ label: categories.find((c) => c._id === categoryId)?.name || "Selected category", changes: { categoryId: null } }] : []),
    ...(priceActive ? [{ label: "Price: Rs. " + (params.get("minPrice") || "0") + " – " + (params.get("maxPrice") || "Any"), changes: { minPrice: null, maxPrice: null } }] : []),
    ...(inStock ? [{ label: "In stock", changes: { inStock: null } }] : []),
    ...tags.map((tag) => ({ label: tag, changes: { tags: tags.filter((value) => value !== tag).join(",") || null } })),
    ...(params.get("supplierId") ? [{ label: "Selected producer", changes: { supplierId: null } }] : []),
  ];

  return (
    <section aria-label="Product filters" aria-busy={pending} className="border-y border-border py-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
          <form className="relative flex min-w-0 flex-1 items-center" onSubmit={(event) => { event.preventDefault(); apply({ search: search.trim() || null }); }}>
            <Search strokeWidth={1.75} aria-hidden="true" className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <Input className={CONTROL + " pl-10 pr-24 text-sm focus-visible:ring-brand-green"} aria-label="Search products" placeholder="Find something fresh" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button type="submit" disabled={pending} className="absolute right-1 h-9 rounded-md px-3 text-sm font-medium text-brand-green hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green disabled:opacity-50">Search</button>
          </form>
          <Select disabled={pending} value={categoryId || "all"} onValueChange={(value) => apply({ categoryId: value === "all" ? null : value })}>
            <SelectTrigger aria-label="Category" className={CONTROL + " w-full sm:w-[190px]"}><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((category) => <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[auto_auto_minmax(0,1fr)] xl:flex">
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" className={FILTER + (priceActive ? SELECTED : "")}>Price <ChevronDown strokeWidth={1.75} aria-hidden="true" className="ml-2 h-3.5 w-3.5" /></Button></PopoverTrigger>
            <PopoverContent className="w-[min(320px,calc(100vw-32px))] rounded-lg p-5" align="start">
              <p className="text-sm font-medium">Price range</p>
              <p className="mb-6 mt-2 text-sm text-muted-foreground">Rs. {prices[0].toLocaleString("en-LK")} – {prices[1].toLocaleString("en-LK")}{prices[1] === sliderMaximum ? "+" : ""}</p>
              <Slider value={prices} min={0} max={sliderMaximum} step={100} minStepsBetweenThumbs={0} thumbLabels={["Minimum price", "Maximum price"]} onValueChange={(values) => setPrices([values[0], values[1]])} />
              <Button disabled={pending} className="mt-6 w-full bg-brand-green text-primary-foreground hover:bg-brand-green/90" onClick={() => apply({ minPrice: prices[0] > 0 ? String(prices[0]) : null, maxPrice: prices[1] < sliderMaximum ? String(prices[1]) : null })}>Apply price</Button>
              {priceActive && <button type="button" disabled={pending} className="mt-3 min-h-11 w-full text-sm text-brand-green hover:underline" onClick={() => apply({ minPrice: null, maxPrice: null })}>Remove price limit</button>}
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" className={FILTER + (refinementCount ? SELECTED : "")}><SlidersHorizontal strokeWidth={1.75} aria-hidden="true" className="mr-2 h-4 w-4" />Filters{refinementCount > 0 && <span className="ml-1.5 rounded-full bg-brand-green px-1.5 py-0.5 text-xs text-primary-foreground">{refinementCount}</span>}</Button></PopoverTrigger>
            <PopoverContent className="w-[min(280px,calc(100vw-32px))] rounded-lg p-4" align="center">
              <p className="mb-2 px-2 text-sm font-medium">Your preferences</p>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 px-2"><Checkbox disabled={pending} checked={inStock} onCheckedChange={(checked) => { setInStock(checked === true); apply({ inStock: checked === true ? "true" : null }); }} /><span className="text-sm">In stock only</span></label>
              <div className="my-2 border-t border-border" />
              {TAGS.map((tag) => <label key={tag} className="flex min-h-11 cursor-pointer items-center gap-3 px-2"><Checkbox disabled={pending} checked={tags.includes(tag)} onCheckedChange={(checked) => { const next = checked === true ? [...tags, tag] : tags.filter((value) => value !== tag); setTags(next); apply({ tags: next.length ? next.join(",") : null }); }} /><span className="text-sm">{tag}</span></label>)}
            </PopoverContent>
          </Popover>
          <Select disabled={pending} value={params.get("sort") || "newest"} onValueChange={(value) => apply({ sort: value === "newest" ? null : value })}>
            <SelectTrigger aria-label="Sort products" className={CONTROL + " col-span-2 min-w-0 sm:col-span-1 xl:w-[175px]"}><SelectValue /></SelectTrigger>
            <SelectContent align="end"><SelectItem value="newest">Latest arrivals</SelectItem><SelectItem value="price-asc">Price: low to high</SelectItem><SelectItem value="price-desc">Price: high to low</SelectItem><SelectItem value="oldest">Oldest first</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      {chips.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Applied filters">
        {chips.map((chip) => <button key={chip.label} type="button" disabled={pending} aria-label={"Remove " + chip.label} onClick={() => apply(chip.changes)} className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/5 px-3 py-2 text-xs text-brand-green hover:bg-brand-green/10 disabled:opacity-50"><span className="truncate">{chip.label}</span><X strokeWidth={1.75} aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /></button>)}
        <button type="button" disabled={pending} onClick={() => { setSearch(""); setPrices([0, 5000]); startTransition(() => router.push(pathname, { scroll: false })); }} className="min-h-11 px-2 text-xs font-medium text-brand-green underline underline-offset-4 disabled:opacity-50">Clear all</button>
      </div>}
      <p role="status" aria-live="polite" className="sr-only">{pending ? "Updating products" : ""}</p>
    </section>
  );
}
