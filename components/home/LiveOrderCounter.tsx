'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveOrderCounterProps {
    className?: string;
}

export default function LiveOrderCounter({ className }: LiveOrderCounterProps) {
    const [orderCount, setOrderCount] = useState(5234);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Simulate live order updates
        const interval = setInterval(() => {
            setIsAnimating(true);
            setOrderCount((prev: number) => prev + Math.floor(Math.random() * 3) + 1);
            setTimeout(() => setIsAnimating(false), 300);
        }, 8000 + Math.random() * 4000); // Random interval 8-12 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn('bg-gradient-to-r from-emerald-50 to-teal-50 py-3', className)}>
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
                    {/* Live Order Counter */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Truck className="w-5 h-5 text-emerald-600" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <span className="text-gray-600">
                            <span
                                className={cn(
                                    'font-bold text-emerald-600 transition-all duration-300',
                                    isAnimating && 'scale-110 text-emerald-700'
                                )}
                            >
                                {orderCount.toLocaleString()}
                            </span>
                            {' '}orders delivered this week
                        </span>
                    </div>

                    {/* Active Users */}
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <span className="text-gray-600">
                            <span className="font-bold text-emerald-600">
                                {(Math.floor(Math.random() * 50) + 127).toLocaleString()}
                            </span>
                            {' '}people shopping now
                        </span>
                    </div>

                    {/* Trending */}
                    <div className="hidden md:flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span className="text-gray-600">
                            <span className="font-bold text-emerald-600">92%</span>
                            {' '}customer satisfaction
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
