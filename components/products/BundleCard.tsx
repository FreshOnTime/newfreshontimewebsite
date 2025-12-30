"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag, Layers, Info } from "lucide-react";
import { Product } from "@/models/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useBag } from "@/contexts/BagContext";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BundleCardProps {
    product: Product;
}

export function BundleCard({ product }: BundleCardProps) {
    const { addToBag, currentBag } = useBag();
    const [isHovered, setIsHovered] = useState(false);

    const handleAddToBag = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentBag) {
            toast.error("Please log in or create a bag first");
            return;
        }

        await addToBag(currentBag.id, product, 1);
        toast.success("Bundle added to cart!");
    };

    const calculateSavings = () => {
        // Logic to calculate savings if individual items prices were known
        // For now, if discountPercentage > 0, show that.
        return product.discountPercentage || 0;
    };

    const savings = calculateSavings();

    return (
        <Link href={`/products/${product._id}`}>
            <div
                className="group relative h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Card className="h-full border-0 bg-white shadow-premium rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-premium-hover">
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 flex gap-2">
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg backdrop-blur-md">
                            <Layers className="w-3 h-3 mr-1" />
                            Bundle Deal
                        </Badge>
                        {savings > 0 && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg">
                                -{savings}% OFF
                            </Badge>
                        )}
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                        <Image
                            src={product.image?.url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay */}
                        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                        {/* Quick Add Button showing on hover */}
                        <div className={`absolute bottom-4 left-0 right-0 px-4 transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <Button
                                className="w-full bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm border border-gray-100"
                                onClick={handleAddToBag}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Bundle
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                        <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                                {product.description}
                            </p>
                        </div>

                        {/* Bundle Items Preview */}
                        {product.bundleItems && product.bundleItems.length > 0 && (
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                                <span className="text-xs font-medium text-gray-400 mr-1">Contains:</span>
                                {product.bundleItems.slice(0, 3).map((item, idx) => (
                                    <TooltipProvider key={idx}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-600 overflow-hidden">
                                                    {/* Ideally show small image, but name initals for now */}
                                                    {/* If we had item.product.image we would use it */}
                                                    {/* We only have product ID in the type unless populated properly on frontend type too */}
                                                    <Layers className="w-3 h-3" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.quantity}x Item</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                                {product.bundleItems.length > 3 && (
                                    <span className="text-xs text-gray-400">+{product.bundleItems.length - 3} more</span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bundle Price</span>
                                <span className="text-lg font-bold text-gray-900">
                                    Rs. {product.pricePerBaseQuantity.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Link>
    );
}
