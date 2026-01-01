'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    reviewCount?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    className?: string;
}

const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
};

export default function StarRating({
    rating,
    maxRating = 5,
    size = 'sm',
    showValue = false,
    reviewCount,
    interactive = false,
    onRatingChange,
    className,
}: StarRatingProps) {
    const handleClick = (value: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(value);
        }
    };

    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
        const filled = i <= Math.floor(rating);
        const partial = !filled && i === Math.ceil(rating) && rating % 1 !== 0;
        const percentage = partial ? (rating % 1) * 100 : 0;

        stars.push(
            <span
                key={i}
                className={cn(
                    'relative inline-block',
                    interactive && 'cursor-pointer hover:scale-110 transition-transform'
                )}
                onClick={() => handleClick(i)}
            >
                {/* Empty star (background) */}
                <Star
                    className={cn(
                        sizeClasses[size],
                        'text-gray-300'
                    )}
                />
                {/* Filled star (overlay) */}
                {(filled || partial) && (
                    <span
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: filled ? '100%' : `${percentage}%` }}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                'text-amber-400 fill-amber-400'
                            )}
                        />
                    </span>
                )}
            </span>
        );
    }

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div className="flex items-center">{stars}</div>
            {showValue && (
                <span className="text-sm font-medium text-gray-700 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
            {reviewCount !== undefined && (
                <span className="text-xs text-gray-500 ml-1">
                    ({reviewCount.toLocaleString()})
                </span>
            )}
        </div>
    );
}
