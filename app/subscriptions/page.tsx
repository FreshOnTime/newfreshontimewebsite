import { Metadata } from 'next';
import dbConnect from '@/lib/database';
import SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import SubscriptionHero from '@/components/subscriptions/SubscriptionHero';
import SubscriptionPlanCard from '@/components/subscriptions/SubscriptionPlanCard';
import { Check, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { defaultSubscriptionPlans } from '@/lib/data/subscriptionPlans';

export const metadata: Metadata = {
    title: 'Subscription Boxes | Fresh Pick',
    description: 'Subscribe to curated boxes of fresh produce delivered weekly. Save time and money with our subscription service.',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getSubscriptionPlans() {
    try {
        await dbConnect();
        const plans = await SubscriptionPlan.find({ isActive: true })
            .sort({ price: 1 })
            .lean();
        return JSON.parse(JSON.stringify(plans));
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
    }
}

export default async function SubscriptionsPage() {
    const dbPlans = await getSubscriptionPlans();

    // Merge DB plans with defaults to ensure all are visible
    // This fixes the issue where only one plan shows up if only one has been created in DB
    const plans = defaultSubscriptionPlans.map(defaultPlan => {
        const existing = dbPlans.find((p: any) => p.slug === defaultPlan.slug);
        return existing || defaultPlan;
    });

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            {/* Editorial Hero - Real Imagery */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover brightness-[0.35]"
                    />
                </div>

                <div className="container mx-auto max-w-5xl text-center relative z-10 text-white pt-20">
                    <span className="inline-block mb-6 text-xs font-bold tracking-[0.3em] uppercase text-[#d4af37] border border-[#d4af37]/30 px-6 py-3 rounded-full backdrop-blur-sm">
                        Signature Collections
                    </span>
                    <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.9] tracking-tight text-white drop-shadow-2xl">
                        The Subscription<br />
                        <span className="text-[#d4af37] italic">Experience</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-zinc-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Weekly provisions of the world's finest produce, curated into elegant boxes for the discerning home.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent" />
                </div>
            </section>

            {/* Plans Grid */}
            <section className="py-24 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[1400px] mx-auto -mt-32 relative z-20">
                        {plans.map((plan: any) => (
                            <SubscriptionPlanCard key={plan._id} plan={plan} />
                        ))}
                    </div>
                </div>
            </section>

            {/* The FreshPick Standard Section */}
            <section className="py-32 bg-[#fafaf9]">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-24">
                        <span className="text-[#0c2f21] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Our Promise</span>
                        <h2 className="font-serif text-5xl md:text-6xl text-[#0c2f21]">
                            The FreshPick Standard
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="group">
                            <div className="relative aspect-[4/5] overflow-hidden mb-8">
                                <img
                                    src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=1000&auto=format&fit=crop"
                                    alt="Harvested Daily"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-[#0c2f21]/10 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#0c2f21] mb-3">Harvested Daily</h3>
                            <p className="text-zinc-600 font-light leading-relaxed">
                                Picked at sunrise and delivered to your doorstep by sunset. We guarantee peak ripeness and flavor in every box.
                            </p>
                        </div>
                        <div className="group md:mt-16">
                            <div className="relative aspect-[4/5] overflow-hidden mb-8">
                                <img
                                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2670&auto=format&fit=crop"
                                    alt="Farmer Direct"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-[#0c2f21]/10 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#0c2f21] mb-3">Farmer Direct</h3>
                            <p className="text-zinc-600 font-light leading-relaxed">
                                100% of your subscription goes directly to supporting local sustainable agriculture. No middlemen, just honest food.
                            </p>
                        </div>
                        <div className="group md:mt-32">
                            <div className="relative aspect-[4/5] overflow-hidden mb-8">
                                <img
                                    src="https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=2670&auto=format&fit=crop"
                                    alt="Zero-Plastic Promise"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-[#0c2f21]/10 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#0c2f21] mb-3">Zero-Plastic Promise</h3>
                            <p className="text-zinc-600 font-light leading-relaxed">
                                Our packaging is fully biodegradable and plastic-free. We believe luxury shouldn't cost the earth.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ - Minimal */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl">Common Questions</h2>
                    </div>
                    <div className="space-y-8">
                        {[
                            { q: "What makes FreshPick boxes unique?", a: "Each FreshPick collection is curated from the top 1% of harvests. Our expert agrarians hand-select produce at peak ripeness for unmatched flavor." },
                            { q: "Can I customize my FreshPick box?", a: "Certainly. Your personal concierge can tailor your weekly delivery to accommodate preferences, allergies, or specific culinary requirements." },
                            { q: "Is the service flexible?", a: "As a FreshPick subscriber, you enjoy complete freedom. Pause your deliveries during travel or cancel indefinitely with a single click." },
                        ].map((item, i) => (
                            <div key={i} className="border-b border-zinc-100 pb-8">
                                <h3 className="font-medium text-lg mb-2">{item.q}</h3>
                                <p className="text-zinc-500 font-light leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
