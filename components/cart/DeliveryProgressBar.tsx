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
            <div className="   border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-brand-green" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-brand-green">Your order qualifies for free delivery.</p>
                        <p className="text-sm text-brand-green">No delivery charges on this order</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isMinOrderMet) {
        return (
            <div className="bg-secondary border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-border rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">Minimum order not met</p>
                        <p className="text-sm text-muted-foreground mb-3">
                            Add Rs. {amountToMin.toLocaleString()} more to place your order
                        </p>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${progressToMin}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Rs. {currentTotal.toLocaleString()}</span>
                            <span>Min: Rs. {minOrderValue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                    <ArrowUp className="w-5 h-5 text-brand-green" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-brand-green">Free delivery with a little more.</p>
                    <p className="text-sm text-brand-green mb-3">
                        Add Rs. {amountToFree.toLocaleString()} more for FREE delivery
                    </p>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progressToFree}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-brand-green mt-1">
                        <span>Rs. {currentTotal.toLocaleString()}</span>
                        <span>Free delivery: Rs. {freeDeliveryThreshold.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
