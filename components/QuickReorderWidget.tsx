'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Clock, Repeat, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
    _id: string;
    orderNumber: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    createdAt: string;
}

export default function QuickReorderWidget() {
    const [lastOrder, setLastOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reordering, setReordering] = useState(false);

    useEffect(() => {
        fetchLastOrder();
    }, []);

    const fetchLastOrder = async () => {
        try {
            const res = await fetch('/api/orders?limit=1');
            const data = await res.json();
            if (data.orders && data.orders.length > 0) {
                setLastOrder(data.orders[0]);
            }
        } catch (error) {
            console.error('Error fetching last order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReorder = async () => {
        if (!lastOrder) return;

        setReordering(true);
        try {
            // Add all items from last order to cart
            const res = await fetch('/api/bags/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: lastOrder._id }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Items added to cart!');
            } else {
                toast.error(data.message || 'Failed to reorder');
            }
        } catch (error) {
            toast.error('Failed to reorder');
        } finally {
            setReordering(false);
        }
    };

    if (isLoading) {
        return null;
    }

    if (!lastOrder) {
        return null;
    }

    const daysAgo = Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Repeat className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Quick Reorder</h3>
                        <p className="text-emerald-100 text-sm flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Order #{lastOrder.orderNumber} • {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-emerald-100">{lastOrder.items.length} items</p>
                        <p className="font-semibold">Rs. {lastOrder.totalAmount.toLocaleString()}</p>
                    </div>
                    <Button
                        onClick={handleReorder}
                        disabled={reordering}
                        className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold"
                    >
                        {reordering ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <ShoppingBag className="w-4 h-4 mr-2" />
                        )}
                        Reorder
                    </Button>
                </div>
            </div>
        </div>
    );
}
