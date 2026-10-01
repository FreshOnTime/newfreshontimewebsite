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
                'group relative flex h-full flex-col overflow-hidden rounded-xl border p-8 transition-all duration-300 md:p-9',
                isFeatured
                    ? 'z-20 border-brand-amber bg-background text-foreground shadow-none '
                    : 'z-10 border-zinc-200 bg-background text-zinc-900 hover:border-emerald-300 hover:shadow-none'
            )}
        >
            {isFeatured && <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-brand-amber" />}

            <div className="relative z-10 mb-8 text-center">
                <h3 className={cn('mb-3 font-sans text-2xl md:text-3xl', isFeatured ? 'text-foreground' : 'text-zinc-900')}>
                    {plan.name}
                </h3>
                <p className={cn('mx-auto max-w-[240px] text-sm font-normal leading-relaxed', isFeatured ? 'text-muted-foreground' : 'text-zinc-500')}>
                    {plan.description}
                </p>
            </div>

            <div className={cn('relative z-10 mb-8 border-b pb-8 text-center', isFeatured ? 'border-border' : 'border-zinc-100')}>
                <div className="flex flex-col items-center justify-center gap-1">
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                        <span className={cn('font-sans text-sm line-through', isFeatured ? 'text-zinc-500' : 'text-muted-foreground')}>
                            Rs. {plan.originalPrice.toLocaleString()}
                        </span>
                    )}
                    <span className={cn('font-sans text-4xl md:text-3xl', isFeatured ? 'text-foreground' : 'text-emerald-900')}>
                        Rs. {plan.price.toLocaleString()}
                    </span>
                    <span className="mt-2 text-xs normal-case text-muted-foreground">
                        {frequencyLabel(plan.frequency)}
                    </span>
                </div>
            </div>

            <div className="relative z-10 mb-8 flex-grow px-2">
                {features.length > 0 ? (
                    <ul className="space-y-4">
                        {features.map((feature) => (
                            <li key={feature} className={cn('flex items-start gap-3 text-sm font-normal', 'text-muted-foreground')}>
                                <Check className={cn('mt-0.5 h-4 w-4 shrink-0', 'text-brand-green')} />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={cn('text-center text-sm leading-relaxed', isFeatured ? 'text-muted-foreground' : 'text-zinc-500')}>
                        See the current plan details during checkout.
                    </p>
                )}
            </div>

            <div className="relative z-10 mt-auto">
                <Link href={`/checkout?plan=${encodeURIComponent(plan.slug)}`} className="block">
                    <Button
                        className={cn(
                            'h-12 w-full rounded-lg text-sm font-bold normal-case shadow-none transition-all duration-300',
                            'bg-brand-amber text-accent-foreground hover:bg-brand-amber/85'
                        )}
                    >
                        Choose plan
                    </Button>
                </Link>

                <div className={cn('mt-6 flex items-center justify-center gap-1.5 text-xs normal-case', isFeatured ? 'text-zinc-500' : 'text-muted-foreground')}>
                    <CalendarClock className="h-3.5 w-3.5" />
                    Recurring schedule
                </div>
            </div>
        </div>
    );
}
