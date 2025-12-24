"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Search, Save, MoreHorizontal, Eye, Edit, Package } from "lucide-react";
import { Product } from "@/models/product";

interface ExistingBundle {
    _id: string;
    name: string;
    sku: string;
    price: number;
    costPrice: number;
    image: string;
    stockQty: number;
    bundleItems: { product: any; quantity: number }[];
    createdAt: string;
}

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
    const [existingBundles, setExistingBundles] = useState<ExistingBundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { register, control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<BundleForm>({
        defaultValues: {
            bundleItems: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "bundleItems"
    });

    // Fetch categories and bundles on mount
    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                if (data.success) setCategories(data.data);
            });
        fetchExistingBundles();
    }, []);

    const fetchExistingBundles = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/products?limit=100");
            const data = await res.json();
            if (data.products) {
                const bundles = data.products.filter((p: any) => p.isBundle === true);
                setExistingBundles(bundles);
            }
        } catch (error) {
            console.error('Failed to fetch bundles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search products for adding to bundle
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
                stockQty: 100,
                minStockLevel: 5,
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
                setIsDialogOpen(false);
                fetchExistingBundles();
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
        const costPrice = (product as any).costPrice || price * 0.7;
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

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this bundle?')) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' });
            if (!res.ok) throw new Error('Failed');
            toast.success('Bundle deleted');
            fetchExistingBundles();
        } catch {
            toast.error('Failed to delete bundle');
        }
    };

    const currency = (v: number) => `Rs. ${(v || 0).toFixed(2)}`;

    const filteredBundles = existingBundles.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bundles</h1>
                    <p className="text-gray-600 mt-2">Manage product bundles and packages</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bundle
                </Button>
            </div>

            {/* Bundle List Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-green-600" />
                        Bundle List
                    </CardTitle>
                    <CardDescription>View and manage product bundles</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search bundles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead className="w-[70px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBundles.map((bundle) => (
                                        <TableRow key={bundle._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={bundle.image || '/placeholder.svg'}
                                                        alt={bundle.name}
                                                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                                    />
                                                    {bundle.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{bundle.sku}</TableCell>
                                            <TableCell className="text-green-600 font-semibold">{currency(bundle.price)}</TableCell>
                                            <TableCell className="text-gray-500">{currency(bundle.costPrice)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{bundle.bundleItems?.length || 0} items</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={bundle.stockQty < 10 ? 'destructive' : 'secondary'}>
                                                    {bundle.stockQty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" /> View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(bundle._id)} className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredBundles.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No bundles found. Create your first bundle!
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Create Bundle Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Bundle</DialogTitle>
                        <DialogDescription>Add products together to create a bundle package</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bundle Name</label>
                                <Input
                                    {...register("name", { required: "Name is required" })}
                                    placeholder="e.g., Weekly Family Essentials"
                                />
                                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">SKU / Code</label>
                                <Input
                                    {...register("sku", { required: "SKU is required" })}
                                    placeholder="e.g., BUNDLE-001"
                                />
                                {errors.sku && <span className="text-xs text-red-500">{errors.sku.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                {...register("description")}
                                placeholder="Describe what's in this bundle..."
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Selling Price (LKR)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("pricePerBaseQuantity", { required: "Price is required" })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
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
                            <label className="text-sm font-medium">Image URL</label>
                            <Input
                                {...register("image")}
                                placeholder="https://..."
                            />
                        </div>

                        {/* Product Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Add Products to Bundle</label>
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
                        </div>

                        {/* Selected Items */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bundle Items ({fields.length})</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{field.name}</div>
                                            <div className="text-xs text-green-600">Rs. {(field as any).price?.toFixed(2) || '0.00'}</div>
                                        </div>
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-center"
                                            {...register(`bundleItems.${index}.quantity` as const)}
                                        />
                                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => remove(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="text-center py-4 text-gray-400 text-sm">
                                        Search and add products above
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cost Price Display */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total Cost Price:</span>
                                <span className="text-lg font-bold text-green-600">
                                    Rs. {fields.reduce((sum, field) => sum + ((field as any).costPrice || 0) * ((field as any).quantity || 1), 0).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Auto-calculated from products</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create Bundle
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
