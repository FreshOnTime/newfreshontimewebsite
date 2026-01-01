'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Purchase {
    name: string;
    location: string;
    product: string;
    time: string;
}

const locations = [
    'Colombo 3', 'Colombo 5', 'Colombo 7', 'Nugegoda', 'Dehiwala',
    'Mount Lavinia', 'Rajagiriya', 'Battaramulla', 'Maharagama', 'Kotte'
];

const products = [
    'Fresh Vegetables Bundle', 'Organic Fruit Box', 'Weekly Essentials Pack',
    'Dairy Bundle', 'Farm Fresh Eggs', 'Premium Rice Pack', 'Snack Box',
    'Healthy Breakfast Kit', 'Green Smoothie Bundle', 'Kitchen Essentials'
];

const names = [
    'Sarah', 'Amal', 'Priya', 'Nuwan', 'Dilini', 'Kasun', 'Thilini',
    'Supun', 'Malini', 'Roshan', 'Chamari', 'Dinesh'
];

function generatePurchase(): Purchase {
    return {
        name: names[Math.floor(Math.random() * names.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        product: products[Math.floor(Math.random() * products.length)],
        time: `${Math.floor(Math.random() * 5) + 1} minutes ago`,
    };
}

export default function RecentPurchasePopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (isDismissed) return;

        // Initial delay before first popup
        const initialDelay = setTimeout(() => {
            showPurchase();
        }, 15000);

        return () => clearTimeout(initialDelay);
    }, [isDismissed]);

    useEffect(() => {
        if (isDismissed || !purchase) return;

        // Set interval for subsequent popups
        const interval = setInterval(() => {
            showPurchase();
        }, 25000 + Math.random() * 10000); // 25-35 seconds

        return () => clearInterval(interval);
    }, [isDismissed, purchase]);

    const showPurchase = () => {
        setPurchase(generatePurchase());
        setIsVisible(true);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setIsVisible(false);
        }, 5000);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
    };

    if (!purchase || !isVisible) return null;

    return (
        <div
            className={cn(
                'fixed bottom-4 left-4 z-50 max-w-sm',
                'transform transition-all duration-500',
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            )}
        >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                            {purchase.name} from {purchase.location}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                            Just ordered <span className="font-medium text-emerald-600">{purchase.product}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{purchase.time}</p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-0.5 bg-gray-100">
                    <div
                        className="h-full bg-emerald-500 animate-shrink"
                        style={{
                            animation: 'shrink 5s linear forwards',
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
            `}</style>
        </div>
    );
}
