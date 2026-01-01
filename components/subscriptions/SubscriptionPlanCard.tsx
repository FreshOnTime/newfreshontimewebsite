'use client';

import { Check, Star, Sparkles, Truck, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubscriptionPlan {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice?: number;
    frequency: string;
    icon: string;
    image?: string;
    color: string;
    features: string[];
    contents: { name: string; quantity: string; category: string }[];
    isFeatured?: boolean;
}

interface SubscriptionPlanCardProps {
    plan: SubscriptionPlan;
}

export default function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
    const isFeatured = plan.isFeatured;
    const frequencyLabel = plan.frequency === 'weekly' ? 'per week' : plan.frequency === 'monthly' ? 'per month' : 'every 2 weeks';

    return (
        <div
            className={cn(
                "relative group flex flex-col h-full transition-all duration-500 rounded-2xl p-8 md:p-10 overflow-hidden",
                isFeatured
                    ? "bg-zinc-900 text-white shadow-2xl scale-105 lg:-mt-4 lg:-mb-4 z-20"
                    : "bg-white text-zinc-900 shadow-sm hover:shadow-xl hover:-translate-y-1 z-10"
            )}
        >
            {/* Featured Badge - Minimal */}
            {isFeatured && (
                <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
            )}

            {/* Header */}
            <div className="text-center mb-8 relative z-10">
                <h3 className={cn("font-serif text-2xl md:text-3xl mb-3", isFeatured ? "text-white" : "text-zinc-900")}>
                    {plan.name}
                </h3>
                <p className={cn("text-sm font-light leading-relaxed max-w-[240px] mx-auto", isFeatured ? "text-zinc-400" : "text-zinc-500")}>
                    {plan.description}
                </p>
            </div>

            {/* Pricing */}
            <div className={cn("text-center mb-8 pb-8 border-b relative z-10", isFeatured ? "border-white/10" : "border-zinc-100")}>
                <div className="flex flex-col items-center justify-center gap-1">
                    {plan.originalPrice && (
                        <span className={cn("text-sm line-through font-serif", isFeatured ? "text-zinc-500" : "text-zinc-400")}>
                            Rs. {plan.originalPrice.toLocaleString()}
                        </span>
                    )}
                    <span className={cn("text-4xl md:text-5xl font-serif", isFeatured ? "text-white" : "text-emerald-900")}>
                        Rs. {plan.price.toLocaleString()}
                    </span>
                    <span className={cn("text-[10px] uppercase tracking-widest mt-2", isFeatured ? "text-zinc-400" : "text-zinc-400")}>{frequencyLabel}</span>
                </div>
            </div>

            {/* Features */}
            <div className="flex-grow mb-8 px-2 relative z-10">
                <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                        <li key={index} className={cn("flex items-start gap-3 text-sm font-light", isFeatured ? "text-zinc-300" : "text-zinc-600")}>
                            <Check className={cn("w-4 h-4 shrink-0 mt-0.5", isFeatured ? "text-emerald-400" : "text-emerald-700")} />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Action */}
            <div className="mt-auto relative z-10">
                <Link href={`/checkout?plan=${plan.slug}`} className="block">
                    <Button
                        className={cn(
                            "w-full h-14 text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-all duration-300 shadow-lg",
                            isFeatured
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                : "bg-zinc-900 text-white hover:bg-zinc-800"
                        )}
                    >
                        Select Box
                    </Button>
                </Link>

                <div className={cn("flex flex-col items-center gap-2 mt-6 text-[10px] uppercase tracking-wider", isFeatured ? "text-zinc-500" : "text-zinc-400")}>
                    <span className="flex items-center gap-1.5">
                        <Truck className="w-3 h-3" />
                        Free Delivery
                    </span>
                </div>
            </div>
        </div>
    );
}
