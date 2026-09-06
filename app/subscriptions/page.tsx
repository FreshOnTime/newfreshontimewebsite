import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { CalendarClock, ChevronDown, Handshake, SlidersHorizontal } from 'lucide-react';
import SubscriptionPlanCard, { type SubscriptionPlan } from '@/components/subscriptions/SubscriptionPlanCard';
import { serverApiFetch } from '@/lib/api/server';

export const metadata: Metadata = {
    title: 'Recurring Orders & Subscription Plans | Fresh Pick',
    description: 'Explore active Fresh Pick recurring-order plans and choose a delivery schedule that fits your household.',
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
        q: 'Where do the plan details come from?',
        a: 'Only active plans configured by the Fresh Pick team are shown here. Prices, features, and contents come from the current plan record rather than a fallback catalogue.',
    },
    {
        q: 'Can recurring deliveries use different schedules?',
        a: 'Available scheduling options are shown during checkout. The final cadence is saved with your subscription when you place the recurring order.',
    },
];

export default async function SubscriptionsPage() {
    const plans = await getSubscriptionPlans();

    return (
        <div className="min-h-screen bg-transparent text-zinc-900">
            <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden md:min-h-[680px]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/bgs/home-hero.jpg"
                        alt="Fresh Pick recurring grocery delivery"
                        fill
                        className="object-cover"
                        priority
                        fetchPriority="high"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black/55" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/90" />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-6 pt-20 text-center text-white">
                    <span className="mb-6 inline-block rounded-full border border-white/30 bg-white/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
                        Recurring delivery
                    </span>
                    <h1 className="mb-7 font-serif text-5xl leading-[0.9] tracking-tight text-white drop-shadow-2xl md:text-7xl lg:text-[6rem]">
                        Your staples,<br />
                        <span className="italic text-emerald-100">on a rhythm.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-zinc-100 drop-shadow-md md:text-xl">
                        Choose from the recurring plans currently available on Fresh Pick and set the schedule during checkout.
                    </p>
                </div>
            </section>

            <section className="relative bg-zinc-50 py-20 md:py-28">
                <div className="container mx-auto px-4">
                    {plans.length > 0 ? (
                        <div className="relative z-20 mx-auto -mt-20 grid max-w-[1400px] grid-cols-1 gap-5 md:-mt-24 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                            {plans.map((plan) => (
                                <SubscriptionPlanCard key={plan._id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <div className="relative z-20 mx-auto -mt-16 max-w-3xl rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-xl md:p-14">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Plans updating</span>
                            <h2 className="mt-4 font-serif text-4xl text-zinc-950 md:text-5xl">No active recurring plans right now.</h2>
                            <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-500">
                                We only show plans that are currently active in the Fresh Pick system, so outdated prices or placeholder boxes are never displayed.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link href="/products" className="rounded-full bg-zinc-950 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900">
                                    Shop current products
                                </Link>
                                <Link href="/contact" className="rounded-full border border-zinc-200 px-7 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-800">
                                    Ask about recurring orders
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white py-20 md:py-28">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="mb-14 max-w-3xl md:mb-16">
                        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">How it works</span>
                        <h2 className="font-serif text-4xl leading-tight text-zinc-950 md:text-6xl">
                            Recurring without the guesswork.
                        </h2>
                        <p className="mt-5 max-w-2xl text-lg font-light leading-8 text-zinc-500">
                            The storefront now reflects live plan configuration instead of source-code assumptions about pricing, contents, delivery, or sustainability claims.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {[
                            {
                                icon: CalendarClock,
                                title: 'Choose a current plan',
                                copy: 'Only active plans configured in Fresh Pick are displayed, including their current price and features.',
                            },
                            {
                                icon: SlidersHorizontal,
                                title: 'Set the schedule',
                                copy: 'Confirm your delivery address and recurring cadence as part of the checkout flow.',
                            },
                            {
                                icon: Handshake,
                                title: 'Backed by the wider network',
                                copy: 'Recurring orders can evolve alongside Fresh Pick’s curated supplier and local-maker partnerships.',
                            },
                        ].map((item) => (
                            <div key={item.title} className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-8 md:p-9">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <h3 className="mt-7 font-serif text-3xl text-zinc-950">{item.title}</h3>
                                <p className="mt-4 font-light leading-7 text-zinc-500">{item.copy}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-zinc-50 py-20 md:py-28">
                <div className="container mx-auto max-w-3xl px-4">
                    <div className="mb-12 text-center">
                        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Support</span>
                        <h2 className="font-serif text-3xl text-zinc-950 md:text-4xl">Common questions</h2>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                        {faqs.map((item) => (
                            <details key={item.q} className="group border-b border-zinc-200 bg-white transition-colors last:border-b-0 open:bg-emerald-50/40">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-6 text-left text-lg font-medium text-zinc-950 transition-colors hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
                                    {item.q}
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-emerald-700 transition-all duration-300 group-open:rotate-180 group-open:border-emerald-200 group-open:bg-emerald-100">
                                        <ChevronDown className="h-4 w-4" />
                                    </span>
                                </summary>
                                <p className="max-w-2xl px-6 pb-6 pr-16 font-light leading-relaxed text-zinc-600">{item.a}</p>
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
