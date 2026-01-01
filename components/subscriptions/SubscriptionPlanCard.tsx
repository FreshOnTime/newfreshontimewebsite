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
                "relative group flex flex-col h-full transition-all duration-500",
                "bg-white border p-8 md:p-10 overflow-hidden",
                isFeatured
                    ? "border-[#d4af37]/30 shadow-2xl scale-[1.02] z-10 bg-[#0c2f21] text-white"
                    : "border-zinc-100 hover:border-[#0c2f21]/20 hover:shadow-xl text-zinc-900 shadow-sm"
            )}
        >
            {/* Featured Badge - Gold Luxury */}
            {isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-[#d4af37] text-[#0c2f21] text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        Signature Box
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-8 relative z-10">
                <h3 className={cn("font-serif text-2xl md:text-3xl mb-3", isFeatured ? "text-white" : "text-zinc-900")}>
                    {plan.name}
                </h3>
                <p className={cn("text-sm font-light leading-relaxed max-w-[240px] mx-auto", isFeatured ? "text-emerald-100/70" : "text-zinc-500")}>
                    {plan.description}
                </p>
            </div>

            {/* Pricing */}
            <div className={cn("text-center mb-8 pb-8 border-b relative z-10", isFeatured ? "border-white/10" : "border-zinc-100")}>
                <div className="flex flex-col items-center justify-center gap-1">
                    {plan.originalPrice && (
                        <span className={cn("text-sm line-through font-serif", isFeatured ? "text-emerald-400/50 decoration-emerald-400/30" : "text-zinc-400 decoration-zinc-300")}>
                            Rs. {plan.originalPrice.toLocaleString()}
                        </span>
                    )}
                    <span className={cn("text-4xl md:text-5xl font-serif", isFeatured ? "text-[#d4af37]" : "text-[#0c2f21]")}>
                        Rs. {plan.price.toLocaleString()}
                    </span>
                    <span className={cn("text-xs uppercase tracking-widest mt-2", isFeatured ? "text-emerald-400" : "text-zinc-400")}>{frequencyLabel}</span>
                </div>
            </div>

            {/* Features */}
            <div className="flex-grow mb-8 px-2 relative z-10">
                <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                        <li key={index} className={cn("flex items-start gap-3 text-sm font-light", isFeatured ? "text-emerald-100" : "text-zinc-600")}>
                            <Check className={cn("w-4 h-4 shrink-0 mt-0.5", isFeatured ? "text-[#d4af37]" : "text-[#0c2f21]")} />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Action */}
            <div className="mt-auto relative z-10">
                <Link href={`/subscriptions/checkout?plan=${plan.slug}`} className="block">
                    <Button
                        className={cn(
                            "w-full h-14 text-xs font-bold uppercase tracking-[0.15em] rounded-none transition-all duration-300",
                            isFeatured
                                ? "bg-[#d4af37] text-[#0c2f21] hover:bg-white hover:text-[#0c2f21]"
                                : "bg-[#0c2f21] text-white hover:bg-[#1a4a36]"
                        )}
                    >
                        Select Box
                    </Button>
                </Link>

                <div className={cn("flex flex-col items-center gap-2 mt-6 text-[10px] uppercase tracking-wider", isFeatured ? "text-emerald-400/60" : "text-zinc-400")}>
                    <span className="flex items-center gap-1.5">
                        <Truck className="w-3 h-3" />
                        Complimentary Delivery
                    </span>
                </div>
            </div>
        </div>
    );
}
