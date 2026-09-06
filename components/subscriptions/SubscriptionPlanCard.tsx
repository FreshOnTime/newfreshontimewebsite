'use client';

import { CalendarClock, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SubscriptionPlan {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice?: number;
    frequency: string;
    icon?: string;
    image?: string;
    color?: string;
    features: string[];
    contents: { name: string; quantity: string; category: string }[];
    isFeatured?: boolean;
}

interface SubscriptionPlanCardProps {
    plan: SubscriptionPlan;
}

function frequencyLabel(frequency: string) {
    switch (frequency) {
        case 'daily': return 'per day';
        case 'weekly': return 'per week';
        case 'biweekly': return 'every 2 weeks';
        case 'monthly': return 'per month';
        default: return frequency ? `/${frequency}` : 'recurring';
    }
}

export default function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
    const isFeatured = plan.isFeatured;
    const features = Array.isArray(plan.features) ? plan.features : [];

    return (
        <div
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-8 transition-all duration-300 md:p-9',
                isFeatured
                    ? 'z-20 border-zinc-800 bg-[#09090b] text-white shadow-2xl ring-1 ring-emerald-500/40'
                    : 'z-10 border-zinc-200 bg-white text-zinc-900 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl'
            )}
        >
            {isFeatured && <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-emerald-500" />}

            <div className="relative z-10 mb-8 text-center">
                <h3 className={cn('mb-3 font-serif text-2xl md:text-3xl', isFeatured ? 'text-white' : 'text-zinc-900')}>
                    {plan.name}
                </h3>
                <p className={cn('mx-auto max-w-[240px] text-sm font-light leading-relaxed', isFeatured ? 'text-zinc-400' : 'text-zinc-500')}>
                    {plan.description}
                </p>
            </div>

            <div className={cn('relative z-10 mb-8 border-b pb-8 text-center', isFeatured ? 'border-white/10' : 'border-zinc-100')}>
                <div className="flex flex-col items-center justify-center gap-1">
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                        <span className={cn('font-serif text-sm line-through', isFeatured ? 'text-zinc-500' : 'text-zinc-400')}>
                            Rs. {plan.originalPrice.toLocaleString()}
                        </span>
                    )}
                    <span className={cn('font-serif text-4xl md:text-5xl', isFeatured ? 'text-white' : 'text-emerald-900')}>
                        Rs. {plan.price.toLocaleString()}
                    </span>
                    <span className="mt-2 text-[10px] uppercase tracking-widest text-zinc-400">
                        {frequencyLabel(plan.frequency)}
                    </span>
                </div>
            </div>

            <div className="relative z-10 mb-8 flex-grow px-2">
                {features.length > 0 ? (
                    <ul className="space-y-4">
                        {features.map((feature) => (
                            <li key={feature} className={cn('flex items-start gap-3 text-sm font-light', isFeatured ? 'text-zinc-300' : 'text-zinc-600')}>
                                <Check className={cn('mt-0.5 h-4 w-4 shrink-0', isFeatured ? 'text-emerald-400' : 'text-emerald-700')} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={cn('text-center text-sm leading-relaxed', isFeatured ? 'text-zinc-400' : 'text-zinc-500')}>
                        See the current plan details during checkout.
                    </p>
                )}
            </div>

            <div className="relative z-10 mt-auto">
                <Link href={`/checkout?plan=${encodeURIComponent(plan.slug)}`} className="block">
                    <Button
                        className={cn(
                            'h-14 w-full rounded-full text-[10px] font-bold uppercase tracking-[0.18em] shadow-none transition-all duration-300',
                            isFeatured
                                ? 'bg-[#d1fae5] text-[#09090b] hover:bg-white'
                                : 'bg-[#09090b] text-white hover:bg-emerald-900'
                        )}
                    >
                        Choose plan
                    </Button>
                </Link>

                <div className={cn('mt-6 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider', isFeatured ? 'text-zinc-500' : 'text-zinc-400')}>
                    <CalendarClock className="h-3.5 w-3.5" />
                    Recurring schedule
                </div>
            </div>
        </div>
    );
}
