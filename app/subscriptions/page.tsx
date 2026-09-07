import Link from 'next/link';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import {
    BrainCircuit,
    CalendarClock,
    ChevronDown,
    Handshake,
    Repeat2,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
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
        q: 'Where do the plan details come from?',
        a: 'Only active plans configured by the FreshPick team are shown here. Prices, features, and contents come from the current plan record rather than a fallback catalogue.',
    },
    {
        q: 'Can recurring deliveries use different schedules?',
        a: 'Available scheduling options are shown during checkout. The final cadence is saved with your subscription when you place the recurring order.',
    },
];

const rhythmRows = [
    ['Household essentials', 'Recurring'],
    ['Delivery preference', 'Flexible'],
    ['Changes', 'Account managed'],
];

export default async function SubscriptionsPage() {
    const plans = await getSubscriptionPlans();

    return (
        <div className="min-h-screen bg-[#f4f6f2] text-zinc-900">
            <section className="relative isolate overflow-hidden bg-[#07100b] px-4 pb-24 pt-28 text-white md:px-8 md:pb-32 md:pt-36">
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_15%,rgba(52,211,153,0.18),transparent_30%),radial-gradient(circle_at_85%_50%,rgba(163,230,53,0.08),transparent_24%)]" />
                <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

                <div className="container mx-auto max-w-7xl">
                    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200">
                                <Repeat2 className="h-3.5 w-3.5" /> FreshPick Smart Basket
                            </span>
                            <h1 className="mt-7 max-w-5xl text-balance font-serif text-6xl font-normal leading-[0.88] tracking-[-0.045em] md:text-8xl lg:text-[7rem]">
                                Your repeat shopping,<br /><span className="italic text-emerald-200">finally on a rhythm.</span>
                            </h1>
                            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">
                                Smart Basket is the recurring layer of FreshPick: choose a live plan, set the delivery rhythm, and manage the routine from your account instead of rebuilding the same shop every week.
                            </p>
                        </div>

                        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-6">
                            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                                <div>
                                    <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-emerald-200">Recurring context</p>
                                    <p className="mt-2 text-sm font-light text-white/45">A household workflow, not a subscription banner.</p>
                                </div>
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 ring-1 ring-emerald-300/10">
                                    <BrainCircuit className="h-4 w-4 text-emerald-200" />
                                </span>
                            </div>
                            <div className="mt-5 space-y-2">
                                {rhythmRows.map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/10 px-3.5 py-3 text-xs">
                                        <span className="text-white/38">{label}</span>
                                        <span className="text-white/68">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-300/[0.07] px-3.5 py-3 text-[9px] font-bold uppercase tracking-[0.17em] text-emerald-200 ring-1 ring-emerald-300/10">
                                <Sparkles className="h-3.5 w-3.5" /> Designed to become increasingly intelligent
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <section className="relative py-16 md:py-20">
                <div className="container mx-auto px-4">
                    {plans.length > 0 ? (
                        <div className="relative z-20 mx-auto -mt-28 grid max-w-[1400px] grid-cols-1 gap-5 md:-mt-32 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                            {plans.map((plan) => (
                                <SubscriptionPlanCard key={plan._id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <div className="relative z-20 mx-auto -mt-24 max-w-3xl rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(10,30,18,0.08)] md:p-14">
                            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-700">Plans updating</span>
                            <h2 className="mt-4 font-serif text-4xl font-normal tracking-[-0.03em] text-zinc-950 md:text-5xl">No active recurring plans right now.</h2>
                            <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-7 text-zinc-500">
                                FreshPick only shows plans that are currently active, so outdated prices or placeholder boxes never become part of the customer experience.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link href="/products" className="rounded-full bg-zinc-950 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-emerald-950">
                                    Open live catalogue
                                </Link>
                                <Link href="/contact" className="rounded-full border border-zinc-200 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-800">
                                    Ask about recurring orders
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white py-20 md:py-28">
                <div className="container mx-auto max-w-7xl px-4 md:px-8">
                    <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.62fr] md:items-end">
                        <div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">How Smart Basket works</span>
                            <h2 className="mt-5 text-balance font-serif text-5xl font-normal leading-[0.95] tracking-[-0.035em] text-zinc-950 md:text-7xl">Recurring without the admin work.</h2>
                        </div>
                        <p className="max-w-xl text-sm font-light leading-7 text-zinc-600 md:justify-self-end">
                            The recurring experience reads directly from live FreshPick plan configuration instead of relying on hard-coded prices, contents or delivery promises.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                icon: CalendarClock,
                                title: 'Choose a live plan',
                                copy: 'Only active plans configured in FreshPick are displayed, including their current price and features.',
                            },
                            {
                                icon: SlidersHorizontal,
                                title: 'Set the rhythm',
                                copy: 'Confirm your delivery address and recurring cadence as part of the checkout flow.',
                            },
                            {
                                icon: Handshake,
                                title: 'Connected to the network',
                                copy: 'Recurring demand can evolve alongside FreshPick’s curated supplier and local-maker partnerships.',
                            },
                        ].map((item, index) => (
                            <div key={item.title} className="flex min-h-[300px] flex-col rounded-[1.75rem] border border-zinc-200/80 bg-[#f7f8f6] p-7 md:p-8">
                                <div className="flex items-center justify-between">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-900 ring-1 ring-zinc-200">
                                        <item.icon className="h-5 w-5 stroke-[1.5]" />
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">0{index + 1}</span>
                                </div>
                                <div className="mt-auto pt-12">
                                    <h3 className="font-serif text-3xl font-normal tracking-[-0.02em] text-zinc-950">{item.title}</h3>
                                    <p className="mt-4 text-sm font-light leading-7 text-zinc-500">{item.copy}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f4f6f2] py-20 md:py-28">
                <div className="container mx-auto max-w-3xl px-4">
                    <div className="mb-10">
                        <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">Support</span>
                        <h2 className="mt-4 font-serif text-4xl font-normal tracking-[-0.02em] text-zinc-950">Common questions</h2>
                    </div>
                    <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(10,30,18,0.04)]">
                        {faqs.map((item) => (
                            <details key={item.q} className="group border-b border-zinc-200 bg-white transition-colors last:border-b-0 open:bg-emerald-50/30">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-6 text-left text-base font-medium text-zinc-950 transition-colors hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
                                    {item.q}
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-emerald-700 transition-all duration-300 group-open:rotate-180 group-open:border-emerald-200 group-open:bg-emerald-50">
                                        <ChevronDown className="h-4 w-4" />
                                    </span>
                                </summary>
                                <p className="max-w-2xl px-6 pb-6 pr-16 text-sm font-light leading-7 text-zinc-600">{item.a}</p>
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
