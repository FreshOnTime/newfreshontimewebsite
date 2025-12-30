'use client';

import { Truck, AlertCircle, ArrowUp } from 'lucide-react';

interface DeliveryProgressProps {
    currentTotal: number;
    minOrderValue?: number;
    freeDeliveryThreshold?: number;
}

export default function DeliveryProgressBar({
    currentTotal,
    minOrderValue = 1500,
    freeDeliveryThreshold = 3000,
}: DeliveryProgressProps) {
    const isMinOrderMet = currentTotal >= minOrderValue;
    const isFreeDelivery = currentTotal >= freeDeliveryThreshold;
    const progressToMin = Math.min((currentTotal / minOrderValue) * 100, 100);
    const progressToFree = Math.min((currentTotal / freeDeliveryThreshold) * 100, 100);

    const amountToMin = minOrderValue - currentTotal;
    const amountToFree = freeDeliveryThreshold - currentTotal;

    if (isFreeDelivery) {
        return (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-emerald-800">🎉 You've unlocked FREE delivery!</p>
                        <p className="text-sm text-emerald-600">No delivery charges on this order</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isMinOrderMet) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-amber-800">Minimum order not met</p>
                        <p className="text-sm text-amber-600 mb-3">
                            Add Rs. {amountToMin.toLocaleString()} more to place your order
                        </p>
                        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                                style={{ width: `${progressToMin}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-amber-600 mt-1">
                            <span>Rs. {currentTotal.toLocaleString()}</span>
                            <span>Min: Rs. {minOrderValue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Min order met, show progress to free delivery
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <ArrowUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-blue-800">Almost there!</p>
                    <p className="text-sm text-blue-600 mb-3">
                        Add Rs. {amountToFree.toLocaleString()} more for FREE delivery
                    </p>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-emerald-500 transition-all duration-500"
                            style={{ width: `${progressToFree}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-blue-600 mt-1">
                        <span>Rs. {currentTotal.toLocaleString()}</span>
                        <span>Free delivery: Rs. {freeDeliveryThreshold.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
