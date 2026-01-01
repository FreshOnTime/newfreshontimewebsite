"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export default function ProductsSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    // State for filters
    const [categoryId, setCategoryId] = useState<string>(params.get("categoryId") || "");
    const [minPrice, setMinPrice] = useState<number>(Number(params.get("minPrice")) || 0);
    const [maxPrice, setMaxPrice] = useState<number>(Number(params.get("maxPrice")) || 5000);
    const [selectedTags, setSelectedTags] = useState<string[]>(params.get("tags")?.split(",") || []);
    const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);

    // Fetch categories
    useEffect(() => {
        fetch("/api/categories")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((j) => {
                const arr = j?.data ?? j;
                if (Array.isArray(arr)) {
                    setCategories(
                        arr
                            .map((c: any) => ({ _id: c._id, name: c.name || c.description }))
                            .filter((c) => c.name)
                    );
                }
            })
            .catch(() => { });
    }, []);

    // Sync state with URL
    useEffect(() => {
        setCategoryId(params.get("categoryId") || "");
        setMinPrice(Number(params.get("minPrice")) || 0);
        setMaxPrice(Number(params.get("maxPrice")) || 5000);
        setSelectedTags(params.get("tags")?.split(",").filter(Boolean) || []);
    }, [params]);

    const apply = useMemo(
        () => (overrides?: Partial<Record<string, string | null>>) => {
            const sp = new URLSearchParams(params.toString());

            const update = (k: string, v: string | null | undefined) => {
                if (v === null || v === "" || v === undefined) sp.delete(k);
                else sp.set(k, v);
            };

            update("categoryId", overrides?.categoryId !== undefined ? overrides.categoryId : categoryId);
            update("minPrice", overrides?.minPrice !== undefined ? overrides.minPrice : (minPrice > 0 ? String(minPrice) : null));
            update("maxPrice", overrides?.maxPrice !== undefined ? overrides.maxPrice : (maxPrice < 5000 ? String(maxPrice) : null));

            const pendingTags = overrides?.tags !== undefined ? overrides.tags : selectedTags.join(",");
            update("tags", pendingTags);

            sp.delete("page"); // Reset pagination
            router.push(`${pathname}?${sp.toString()}`);
        },
        [params, pathname, router, categoryId, minPrice, maxPrice, selectedTags]
    );

    const toggleTag = (tag: string) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag];

        setSelectedTags(newTags);
        apply({ tags: newTags.join(",") });
    };

    const clearAll = () => {
        setCategoryId("");
        setMinPrice(0);
        setMaxPrice(5000);
        setSelectedTags([]);
        router.push(pathname);
    };

    // Sections config
    const dietaryFilters = ["Organic", "Gluten-Free", "Vegan", "Keto", "Halal"];
    const originFilters = ["Local", "Imported", "Estate-Grown", "Hand-Picked"];

    return (
        <div className="w-full lg:w-72 shrink-0 space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <h3 className="font-serif text-lg font-medium text-zinc-900">Refine Selection</h3>
                {(categoryId || minPrice > 0 || maxPrice < 5000 || selectedTags.length > 0) && (
                    <button
                        onClick={clearAll}
                        className="text-xs font-bold tracking-widest text-zinc-400 hover:text-emerald-600 uppercase transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-6">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-900 mb-4">Aisles</h4>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                        <div
                            onClick={() => apply({ categoryId: "" })}
                            className={`cursor-pointer flex items-center justify-between group ${!categoryId ? 'text-emerald-700' : 'text-zinc-600 hover:text-emerald-600'}`}
                        >
                            <span className="text-sm font-medium transition-colors">All Products</span>
                            {!categoryId && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                        {categories.map((c) => (
                            <div
                                key={c._id}
                                onClick={() => apply({ categoryId: c._id })}
                                className={`cursor-pointer flex items-center justify-between group ${categoryId === c._id ? 'text-emerald-700' : 'text-zinc-600 hover:text-emerald-600'}`}
                            >
                                <span className="text-sm font-medium transition-colors">{c.name}</span>
                                {categoryId === c._id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Price */}
            <div className="space-y-6">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-900 mb-4">Price Range</h4>
                <div className="px-1">
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
                        className="my-6"
                    />
                </div>
                <div className="flex items-center justify-between text-sm font-serif text-zinc-600">
                    <span>LKR {minPrice}</span>
                    <span>LKR {maxPrice}+</span>
                </div>
            </div>

            {/* Dietary */}
            <div className="space-y-6">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-900 mb-4">Dietary</h4>
                <div className="space-y-3">
                    {dietaryFilters.map((tag) => (
                        <div key={tag} className="flex items-center space-x-3">
                            <Checkbox
                                id={`diet-${tag}`}
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={() => toggleTag(tag)}
                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-zinc-300"
                            />
                            <label
                                htmlFor={`diet-${tag}`}
                                className="text-sm font-medium text-zinc-600 cursor-pointer select-none hover:text-emerald-700 transition-colors"
                            >
                                {tag}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Origin */}
            <div className="space-y-6">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-900 mb-4">Provenance</h4>
                <div className="space-y-3">
                    {originFilters.map((tag) => (
                        <div key={tag} className="flex items-center space-x-3">
                            <Checkbox
                                id={`origin-${tag}`}
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={() => toggleTag(tag)}
                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-zinc-300"
                            />
                            <label
                                htmlFor={`origin-${tag}`}
                                className="text-sm font-medium text-zinc-600 cursor-pointer select-none hover:text-emerald-700 transition-colors"
                            >
                                {tag}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
