"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Layers, Plus, Trash2, Search, Save } from "lucide-react";
import { Product } from "@/models/product";
interface BundleForm {
    name: string;
    sku: string;
    description: string;
    pricePerBaseQuantity: number;
    image: string;
    categoryId: string;
    bundleItems: { productId: string; name: string; quantity: number; price: number; costPrice: number }[];
}

interface Category {
    _id: string;
    name: string;
}

export default function BundlesPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    const { register, control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<BundleForm>({
        defaultValues: {
            bundleItems: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "bundleItems"
    });

    // Fetch categories on mount
    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                if (data.success) setCategories(data.data);
            });
    }, [setValue]);

    // Search products
    useEffect(() => {
        if (productSearch.length < 3) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/products?search=${productSearch}&limit=5`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setSearchResults(data.data.products);
                });
        }, 500);
        return () => clearTimeout(timer);
    }, [productSearch]);

    const onSubmit = async (data: BundleForm) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: data.name,
                sku: data.sku,
                description: data.description,
                price: Number(data.pricePerBaseQuantity),
                costPrice: (data.bundleItems || []).reduce((sum, item) => sum + ((item.costPrice || 0) * Number(item.quantity || 1)), 0) || 0,
                image: data.image || "/placeholder.svg",
                categoryId: data.categoryId,

                isBundle: true,
                bundleItems: data.bundleItems.map(item => ({
                    product: item.productId,
                    quantity: Number(item.quantity)
                })),
                // Defaults
                stockQty: 100,
                minStockLevel: 5,
                // Optional but good to have defaults
                tags: ["Bundle"],
                attributes: {
                    baseMeasurementQuantity: 1,
                    measurementUnit: "ea",
                    isSoldAsUnit: true,
                }
            };

            console.log('Bundle payload:', JSON.stringify(payload, null, 2));

            const response = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Bundle created successfully");
                reset();
            } else {
                toast.error(result.error || result.message || "Failed to create bundle");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const addProductToBundle = (product: Product) => {
        const price = (product as any).price || (product as any).pricePerBaseQuantity || 0;
        const costPrice = (product as any).costPrice || price * 0.7; // Default cost to 70% of price if not available
        append({
            productId: product._id || "",
            name: product.name,
            quantity: 1,
            price: price,
            costPrice: costPrice
        });
        setProductSearch("");
        setSearchResults([]);
    };

    return (
        <div className="space-y-8 p-8 max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="bg-green-50 p-3 rounded-2xl">
                    <Layers className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bundle Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage product bundles (e.g., Family Packs).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-xl ring-1 ring-black/5">
                        <CardHeader>
                            <CardTitle>Bundle Details</CardTitle>
                            <CardDescription>Basic information about this pack.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="bundle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Bundle Name</label>
                                        <Input
                                            {...register("name", { required: "Name is required" })}
                                            placeholder="e.g., Weekly Family Essentials"
                                        />
                                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">SKU / Code</label>
                                        <Input
                                            {...register("sku", { required: "SKU is required" })}
                                            placeholder="e.g., BUNDLE-001"
                                        />
                                        {errors.sku && <span className="text-xs text-red-500">{errors.sku.message}</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <Textarea
                                        {...register("description", { required: "Description is required" })}
                                        placeholder="Describe what's in this bundle..."
                                    />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Selling Price (LKR)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...register("pricePerBaseQuantity", { required: "Selling price is required" })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Category</label>
                                        <Select onValueChange={(val) => setValue("categoryId", val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Image URL</label>
                                    <Input
                                        {...register("image")}
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-gray-500">Paste an image URL for the bundle cover.</p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-xl ring-1 ring-black/5 h-full">
                        <CardHeader>
                            <CardTitle>Bundle Items</CardTitle>
                            <CardDescription>Add products to this bundle.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Product Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products to add..."
                                    className="pl-9"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map(p => {
                                            const price = (p as any).price || (p as any).pricePerBaseQuantity || 0;
                                            const imageUrl = typeof p.image === 'string' ? p.image : p.image?.url || '/placeholder.svg';
                                            return (
                                                <div
                                                    key={p._id}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm border-b border-gray-50 last:border-0"
                                                    onClick={() => addProductToBundle(p)}
                                                >
                                                    <img src={imageUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt={p.name} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{p.name}</div>
                                                        <div className="text-green-600 font-semibold">Rs. {price.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Selected Items List */}
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{field.name}</div>
                                            <div className="text-xs text-green-600">Rs. {(field as any).price?.toFixed(2) || '0.00'}</div>
                                        </div>
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-center"
                                            {...register(`bundleItems.${index}.quantity` as const)}
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => remove(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        No items added yet.
                                    </div>
                                )}
                            </div>

                            {/* Calculated Cost Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Total Cost Price:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        Rs. {fields.reduce((sum, field) => sum + ((field as any).costPrice || 0) * ((field as any).quantity || 1), 0).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Auto-calculated from products</p>
                            </div>

                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create Bundle
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
