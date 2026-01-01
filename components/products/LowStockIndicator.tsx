'use client';

import { AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LowStockIndicatorProps {
    stockQuantity: number;
    threshold?: number;
    showExact?: boolean;
    className?: string;
}

export default function LowStockIndicator({
    stockQuantity,
    threshold = 10,
    showExact = true,
    className,
}: LowStockIndicatorProps) {
    if (stockQuantity <= 0) {
        return (
            <div className={cn('flex items-center gap-1 text-red-600', className)}>
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-semibold">Out of Stock</span>
            </div>
        );
    }

    if (stockQuantity > threshold) {
        return null; // Don't show anything if stock is good
    }

    const isVeryLow = stockQuantity <= 3;

    return (
        <div
            className={cn(
                'flex items-center gap-1',
                isVeryLow ? 'text-red-600' : 'text-amber-600',
                className
            )}
        >
            <Flame className={cn('w-3 h-3', isVeryLow && 'animate-pulse')} />
            <span className="text-xs font-semibold">
                {showExact ? `Only ${stockQuantity} left!` : 'Low Stock'}
            </span>
        </div>
    );
}
