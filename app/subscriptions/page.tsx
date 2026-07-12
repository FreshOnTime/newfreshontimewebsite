import Image from 'next/image';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import SubscriptionPlanCard from '@/components/subscriptions/SubscriptionPlanCard';
import { ChevronDown } from 'lucide-react';
import { defaultSubscriptionPlans } from '@/lib/data/subscriptionPlans';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
    title: 'Recurring Orders & Subscription Boxes | Fresh Pick',
    description: 'Set up recurring orders for fresh products. Subscribe to curated boxes of fresh produce delivered weekly. Automate your grocery shopping with Fresh Pick.',
};

// Use ISR: subscription plans change rarely (admin-managed).
// 5-minute revalidation avoids a DB call on every request while keeping data fresh.
export const revalidate = 300;

const getSubscriptionPlans = unstable_cache(async () => {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
            include: { contents: true },
        });

        return JSON.parse(JSON.stringify(plans.map((plan) => ({
            ...plan,
            _id: plan.id,
            price: Number(plan.price),
            originalPrice: plan.originalPrice == null ? undefined : Number(plan.originalPrice),
        }))));
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
    }
}, ['active-subscription-plans-v1'], { revalidate: 300, tags: ['subscription-plans'] });

export default async function SubscriptionsPage() {
    const dbPlans = await getSubscriptionPlans();

    // Merge DB plans with defaults to ensure all are visible
    // This fixes the issue where only one plan shows up if only one has been created in DB
    const plans = defaultSubscriptionPlans.map(defaultPlan => {
        const existing = dbPlans.find((p: any) => p.slug === defaultPlan.slug);
        return existing || defaultPlan;
    });

    return (
        <div className="min-h-screen bg-transparent text-zinc-900">
            {/* Editorial Hero */}
            <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden md:min-h-[700px]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/bgs/home-hero.jpg"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                        fetchPriority="high"
                        sizes="100vw"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/55" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/90" />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-6 pt-20 text-center text-white">
                    <span className="mb-6 inline-block rounded-full border border-white/30 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
                        Private Client Services
                    </span>
                    <h1 className="mb-7 font-serif text-5xl leading-[0.9] tracking-tight text-white drop-shadow-2xl md:text-7xl lg:text-[6.5rem]">
                        The Weekly<br />
                        <span className="italic text-emerald-100">Curation</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-zinc-100 drop-shadow-md md:text-xl">
                        Weekly provisions of the world's finest produce, curated into elegant boxes for the discerning home.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-80 md:bottom-12">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
                </div>
            </section>

            {/* Plans Grid */}
            <section className="relative bg-zinc-50 py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="relative z-20 mx-auto grid max-w-[1400px] grid-cols-1 gap-5 -mt-20 md:-mt-24 lg:grid-cols-4 lg:gap-6">
                        {plans.map((plan: any) => (
                            <SubscriptionPlanCard key={plan._id} plan={plan} />
                        ))}
                    </div>
                </div>
            </section>

            {/* The FreshPick Standard Section */}
            <section className="bg-white py-20 md:py-28">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="mb-16 text-center md:mb-20">
                        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Our Promise</span>
                        <h2 className="font-serif text-4xl text-zinc-950 md:text-6xl">
                            The FreshPick Standard
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
                        <div className="group">
                            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-zinc-100">
                                <Image
                                    src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=1000&auto=format&fit=crop"
                                    alt="Fresh harvested vegetables daily for recurring orders"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                            <h3 className="mb-3 text-2xl font-serif text-zinc-950">Harvested Daily</h3>
                            <p className="text-zinc-500 font-light leading-relaxed">
                                Picked at sunrise and delivered to your doorstep by sunset. We guarantee peak ripeness and flavor in every box.
                            </p>
                        </div>
                        <div className="group">
                            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-zinc-100">
                                <Image
                                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2670&auto=format&fit=crop"
                                    alt="Direct from farmers recurring fresh produce delivery"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                            <h3 className="mb-3 text-2xl font-serif text-zinc-950">Farmer Direct</h3>
                            <p className="text-zinc-500 font-light leading-relaxed">
                                100% of your subscription goes directly to supporting local sustainable agriculture. No middlemen, just honest food.
                            </p>
                        </div>
                        <div className="group">
                            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-zinc-100">
                                <Image
                                    src="https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=2670&auto=format&fit=crop"
                                    alt="Eco-friendly zero plastic fresh products delivery"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                            <h3 className="mb-3 text-2xl font-serif text-zinc-950">Zero-Plastic Promise</h3>
                            <p className="text-zinc-500 font-light leading-relaxed">
                                Our packaging is fully biodegradable and plastic-free. We believe luxury shouldn't cost the earth.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ - Minimal */}
            <section className="bg-zinc-50 py-20 md:py-28">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="mb-12 text-center">
                        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Support</span>
                        <h2 className="font-serif text-3xl text-zinc-950 md:text-4xl">Common Questions</h2>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                        {[
                            { q: "What makes FreshPick boxes unique?", a: "Each FreshPick collection is curated from the top 1% of harvests. Our expert agrarians hand-select produce at peak ripeness for unmatched flavor." },
                            { q: "Can I customize my FreshPick box?", a: "Certainly. Your personal concierge can tailor your weekly delivery to accommodate preferences, allergies, or specific culinary requirements." },
                            { q: "Is the service flexible?", a: "As a FreshPick subscriber, you enjoy complete freedom. Pause your deliveries during travel or cancel indefinitely with a single click." },
                        ].map((item) => (
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
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What makes FreshPick boxes unique?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Each FreshPick collection is curated from the top 1% of harvests. Our expert agrarians hand-select produce at peak ripeness for unmatched flavor."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Can I customize my FreshPick box?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Certainly. Your personal concierge can tailor your weekly delivery to accommodate preferences, allergies, or specific culinary requirements."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is the service flexible?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "As a FreshPick subscriber, you enjoy complete freedom. Pause your deliveries during travel or cancel indefinitely with a single click."
                                }
                            }
                        ]
                    })
                }}
            />
        </div>
    );
}
