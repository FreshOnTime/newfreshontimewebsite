'use client';

import { CalendarClock, Check } from 'lucide-react';
import Link from 'next/link';
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
                'group relative flex h-full flex-col overflow-hidden border-t p-6 transition-colors md:p-8',
                isFeatured
                    ? 'z-20 border-primary bg-background text-foreground shadow-none '
                    : 'z-10 border-border bg-background text-foreground hover:border-border hover:shadow-none'
            )}
        >
            {isFeatured && <div className="absolute inset-x-8 top-0 h-1 rounded-b-md bg-primary" />}

            <div className="relative z-10 mb-8 text-left">
                <h3 className={cn('mb-3 font-serif text-2xl font-normal md:text-3xl', isFeatured ? 'text-foreground' : 'text-foreground')}>
                    {plan.name}
                </h3>
                <p className={cn('max-w-sm text-sm font-normal leading-relaxed', isFeatured ? 'text-muted-foreground' : 'text-muted-foreground')}>
                    {plan.description}
                </p>
            </div>

            <div className={cn('relative z-10 mb-8 border-b pb-8 text-left', isFeatured ? 'border-border' : 'border-border')}>
                <div className="flex flex-col items-start justify-center gap-1">
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                        <span className={cn('font-sans text-sm line-through', isFeatured ? 'text-muted-foreground' : 'text-muted-foreground')}>
                            Rs. {plan.originalPrice.toLocaleString()}
                        </span>
                    )}
                    <span className={cn('font-sans text-4xl md:text-3xl', isFeatured ? 'text-foreground' : 'text-brand-green')}>
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
                    <p className={cn('text-left text-sm leading-relaxed', isFeatured ? 'text-muted-foreground' : 'text-muted-foreground')}>
                        See the current plan details during checkout.
                    </p>
                )}
            </div>

            <div className="relative z-10 mt-auto">
                <Link href={`/checkout?plan=${encodeURIComponent(plan.slug)}`} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-amber px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-brand-amber/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green">Choose plan</Link>

                <div className={cn('mt-6 flex items-center gap-1.5 text-xs normal-case', isFeatured ? 'text-muted-foreground' : 'text-muted-foreground')}>
                    <CalendarClock className="h-3.5 w-3.5" />
                    Recurring schedule
                </div>
            </div>
        </div>
    );
}
