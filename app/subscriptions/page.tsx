
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import Link from 'next/link';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { CalendarClock, ChevronDown, Handshake, SlidersHorizontal } from 'lucide-react';
import SubscriptionPlanCard, { type SubscriptionPlan } from '@/components/subscriptions/SubscriptionPlanCard';
import { serverApiFetch } from '@/lib/api/server';

export const metadata: Metadata = {
    title: 'Smart Basket | Recurring Grocery Delivery | FreshPick',
    description: 'FreshPick Smart Basket turns repeat household shopping into a flexible recurring rhythm with live subscription plans and delivery scheduling.',
};

export const revalidate = 300;

const getSubscriptionPlans = unstable_cache(async (): Promise<SubscriptionPlan[]> => {
    try {
        const response = await serverApiFetch('/api/subscription-plans');
        if (!response.ok) return [];
        const data = await response.json();
        if (!data?.success || !Array.isArray(data.plans)) return [];

        return data.plans
            .filter((plan: SubscriptionPlan) => Boolean(plan?._id && plan.slug && plan.name))
            .map((plan: SubscriptionPlan) => ({
                ...plan,
                price: Number(plan.price || 0),
                originalPrice: plan.originalPrice == null ? undefined : Number(plan.originalPrice),
                features: Array.isArray(plan.features) ? plan.features : [],
                contents: Array.isArray(plan.contents) ? plan.contents : [],
            }));
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
    }
}, ['active-subscription-plans-api-v2'], { revalidate: 300, tags: ['subscription-plans'] });

const faqs = [
    {
        q: 'What happens after I choose a plan?',
        a: 'You will continue to checkout, confirm your delivery address, and select the recurring schedule available for that plan.',
    },
    {
        q: 'Where can I see what is included?',
        a: 'Each plan shows its price and features. Check the plan details during checkout before placing your recurring order.',
    },
    {
        q: 'Can recurring deliveries use different schedules?',
        a: 'Available scheduling options are shown during checkout. The final cadence is saved with your subscription when you place the recurring order.',
    },
];

export default async function SubscriptionsPage() {
    const plans = await getSubscriptionPlans();

    return (
        <div className="min-h-screen bg-background text-zinc-900">
            <PremiumPageHeader title="Weekly baskets" subtitle="Choose a plan and set up a recurring delivery." />

            <section className="relative py-8 md:py-8">
                <div className="container mx-auto px-4">
                    {plans.length > 0 ? (
                        <div className="relative z-20 mx-auto mt-6 grid max-w-[1400px] grid-cols-1 gap-5 md:mt-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                            {plans.map((plan) => (
                                <SubscriptionPlanCard key={plan._id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <div className="relative z-20 mx-auto mt-0 max-w-3xl rounded-xl border border-zinc-200 bg-background p-10 text-center md:p-14">
                            <span className="text-xs font-bold normal-case text-emerald-700">Plans updating</span>
                            <h2 className="mt-4 font-sans text-2xl font-semibold text-zinc-950 md:text-2xl">No active recurring plans right now.</h2>
                            <p className="mx-auto mt-5 max-w-xl text-sm font-normal leading-7 text-zinc-500">
                                Browse our groceries or contact us to ask about recurring deliveries.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link href="/products" className="rounded-full bg-brand-amber px-7 py-3.5 text-xs font-bold normal-case text-accent-foreground transition-colors hover:bg-brand-amber/85">
                                    Shop all products
                                </Link>
                                <Link href="/contact" className="rounded-full border border-zinc-200 px-7 py-3.5 text-xs font-bold normal-case text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-800">
                                    Ask about recurring orders
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-background py-8 md:py-10">
                <div className="container mx-auto max-w-7xl px-4 md:px-8">
                    <div className="mb-6 grid gap-7 md:grid-cols-[1fr_0.62fr] md:items-end">
                        <div>
                            <span className="text-xs font-bold normal-case text-emerald-700">How Smart Basket works</span>
                            <h2 className="mt-5 text-balance font-sans text-2xl font-semibold leading-tight text-zinc-950 md:text-2xl">Recurring without the admin work.</h2>
                        </div>
                        <p className="max-w-xl text-sm font-normal leading-7 text-zinc-600 md:justify-self-end">
                            Choose the basket that suits your household, then select a delivery schedule at checkout.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                icon: CalendarClock,
                                title: 'Choose your basket',
                                copy: 'Compare the contents, prices and features of our available baskets.',
                            },
                            {
                                icon: SlidersHorizontal,
                                title: 'Set the rhythm',
                                copy: 'Confirm your delivery address and recurring cadence as part of the checkout flow.',
                            },
                            {
                                icon: Handshake,
                                title: 'Manage your deliveries',
                                copy: 'Find your subscription and upcoming deliveries in your account.',
                            },
                        ].map((item, index) => (
                            <div key={item.title} className="flex min-h-0 flex-col rounded-xl border border-zinc-200/80 bg-background p-7 md:p-8">
                                <div className="flex items-center justify-between">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-emerald-900 ring-1 ring-zinc-200">
                                        <item.icon className="h-5 w-5 stroke-[1.5]" />
                                    </span>
                                    <span className="text-xs font-bold normal-case text-muted-foreground">0{index + 1}</span>
                                </div>
                                <div className="mt-auto pt-6">
                                    <h3 className="font-sans text-xl font-semibold text-zinc-950">{item.title}</h3>
                                    <p className="mt-4 text-sm font-normal leading-7 text-zinc-500">{item.copy}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-background py-8 md:py-10">
                <div className="container mx-auto max-w-3xl px-4">
                    <div className="mb-10">
                        <span className="text-xs font-bold normal-case text-emerald-700">Support</span>
                        <h2 className="mt-4 font-sans text-2xl font-semibold text-zinc-950">Common questions</h2>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-background">
                        {faqs.map((item) => (
                            <details key={item.q} className="group border-b border-zinc-200 bg-background transition-colors last:border-b-0 open:bg-emerald-50/30">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-6 text-left text-base font-medium text-zinc-950 transition-colors hover:bg-background [&::-webkit-details-marker]:hidden">
                                    {item.q}
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-background text-emerald-700 transition-all duration-300 group-open:rotate-180 group-open:border-emerald-200 group-open:bg-emerald-50">
                                        <ChevronDown className="h-4 w-4" />
                                    </span>
                                </summary>
                                <p className="max-w-2xl px-6 pb-6 pr-16 text-sm font-normal leading-7 text-zinc-600">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqs.map((item) => ({
                            "@type": "Question",
                            "name": item.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": item.a,
                            },
                        })),
                    }),
                }}
            />
        </div>
    );
}
