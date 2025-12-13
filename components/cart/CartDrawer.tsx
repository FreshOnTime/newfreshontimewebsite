"use client";

import { useRef, useEffect } from "react";
import { useBag } from "@/contexts/BagContext";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { currentBag, removeFromBag, updateBagItem, loading } = useBag();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                drawerRef.current &&
                !drawerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Prevent body scroll
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const items = currentBag?.items || [];

    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
        0
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={drawerRef}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100/50 p-2 rounded-full">
                                    <ShoppingBag className="w-5 h-5 text-emerald-700" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Bag</h2>
                                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                    {items.length}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/30">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-100/80 rounded-full flex items-center justify-center mb-2">
                                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Your bag is empty</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Looks like you haven't added anything yet. Start shopping to fill it up!
                                    </p>
                                    <Button
                                        onClick={onClose}
                                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
                                    >
                                        Start Shopping
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6">
                                    {items.map((item) => (
                                        <div
                                            key={item.product.id}
                                            className="group flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100/50 transition-all duration-200"
                                        >
                                            {/* Product Image */}
                                            <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 relative overflow-hidden ring-1 ring-gray-100">
                                                {item.product.images[0]?.url ? (
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ShoppingBag className="w-6 h-6 opacity-30" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info & Controls */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                                                        {item.product.name}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeFromBag(currentBag!.id, item.product.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-200/50">
                                                        <button
                                                            onClick={() => updateBagItem(currentBag!.id, item.product.id, item.quantity - 1)}
                                                            disabled={loading || item.quantity <= 1}
                                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-sm font-semibold text-gray-900 w-4 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateBagItem(currentBag!.id, item.product.id, item.quantity + 1)}
                                                            disabled={loading}
                                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-emerald-700 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">
                                                            Rs. {(Number(item.product.price || 0) * item.quantity).toFixed(2)}
                                                        </div>
                                                        {item.quantity > 1 && (
                                                            <div className="text-xs text-gray-500">
                                                                Rs. {Number(item.product.price).toFixed(2)} each
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-100 bg-white p-6 pb-8 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 font-medium">Subtotal</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            Rs. {subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center">
                                        Shipping & taxes calculated at checkout
                                    </p>

                                    <Link href="/checkout" onClick={onClose} className="block">
                                        <Button
                                            className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-lg font-bold shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 transition-all group"
                                        >
                                            Checkout
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href="/bags" onClick={onClose}>
                                            <Button variant="outline" className="w-full rounded-xl h-11 border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50">
                                                View Cart
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            onClick={onClose}
                                            className="w-full rounded-xl h-11 text-gray-500 hover:bg-gray-100"
                                        >
                                            Continue Shopping
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
