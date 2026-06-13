import Link from "next/link";
import {
    ArrowRight,
    Building2,
    CalendarCheck,
    ClipboardCheck,
    Home,
    Leaf,
    ShieldCheck,
    Sprout,
    Truck,
    Utensils,
} from "lucide-react";

const partnerSegments = [
    {
        icon: Utensils,
        title: "Restaurants & cloud kitchens",
        description: "Chef-ready vegetables, fruit, herbs, dairy, pantry essentials, and daily top-ups for busy Colombo kitchens.",
    },
    {
        icon: Building2,
        title: "Hotels, cafes & offices",
        description: "Reliable recurring supply for breakfast spreads, staff meals, events, boardrooms, and guest-facing hospitality.",
    },
    {
        icon: Home,
        title: "Premium households",
        description: "Weekly household grocery plans for families, villas, apartments, and private residences that want consistent freshness.",
    },
];

const operatingModel = [
    {
        icon: Sprout,
        title: "Farmer-first sourcing",
        description: "We work with trusted growers and regional farm networks, helping farmers move better harvests while giving buyers cleaner supply.",
    },
    {
        icon: ClipboardCheck,
        title: "Quality-controlled picking",
        description: "Orders are selected for freshness, size, ripeness, and use case, so kitchens and homes receive produce that fits the requirement.",
    },
    {
        icon: Truck,
        title: "Planned delivery rhythm",
        description: "Daily, weekly, and custom recurring delivery schedules help teams reduce last-minute purchasing and inconsistent stock levels.",
    },
    {
        icon: CalendarCheck,
        title: "Recurring order support",
        description: "Set repeat baskets for restaurant prep, office pantry needs, household staples, or seasonal produce requirements.",
    },
];

const serviceAreas = ["Colombo", "Rajagiriya", "Battaramulla", "Nawala", "Nugegoda", "Dehiwala", "Mount Lavinia", "Kollupitiya", "Bambalapitiya"];

export default function B2BContent() {
    return (
        <div className="overflow-hidden bg-[#020303] text-white selection:bg-emerald-300 selection:text-zinc-950">
            <HeroSection />
            <PartnerSegments />
            <FarmerNetwork />
            <OperatingModel />
            <ServiceAreaSection />
            <ConciergeSection />
        </div>
    );
}

function HeroSection() {
    return (
        <section className="relative min-h-[82vh] overflow-hidden bg-[#050606] px-4 py-28 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,#0b0f0d_0%,#050606_52%,#020303_100%)]" />
                <div className="absolute left-1/2 top-0 h-px w-[76%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
                <div className="absolute right-10 top-24 h-72 w-72 rounded-full bg-emerald-300/[0.045] blur-3xl" />
                <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-amber-300/[0.035] blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto flex min-h-[62vh] flex-col items-center justify-center text-center">
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
                    Fresh Pick Supply Network
                </span>
                <h1 className="mt-8 max-w-6xl font-serif text-5xl font-medium leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
                    Premium produce supply for <span className="italic text-emerald-300">restaurants, farmers & households</span>
                </h1>
                <p className="mt-8 max-w-3xl text-lg font-light leading-relaxed text-zinc-300 md:text-xl">
                    A curated farm-to-door procurement service for restaurants, hotels, cafes, offices, and premium homes across Colombo. Consistent sourcing, planned recurring orders, and freshness you can build menus and weekly routines around.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="#apply" className="group rounded-full bg-emerald-300 px-8 py-4 font-bold text-zinc-950 shadow-[0_16px_45px_rgba(16,185,129,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-200">
                        <span className="flex items-center gap-2">
                            Request a supply plan
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Link>
                    <Link href="/products" className="rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-emerald-300/40 hover:bg-emerald-300/10 hover:text-emerald-100">
                        Browse products
                    </Link>
                </div>

                <div className="mt-14 grid w-full max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
                    {["Direct farmer sourcing", "Recurring grocery plans", "Restaurant-grade fulfilment"].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm font-medium text-zinc-300">
                            <span className="mr-2 text-emerald-300">•</span>{item}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PartnerSegments() {
    return (
        <section className="relative border-y border-white/5 bg-[#050606] py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-14 max-w-3xl">
                    <span className="mb-5 block text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Who we serve</span>
                    <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                        Built for daily operations, not one-off grocery runs.
                    </h2>
                    <p className="mt-5 text-lg font-light leading-relaxed text-zinc-400">
                        Fresh Pick supports businesses and households that need dependable quality, repeatable orders, and a cleaner connection between farmers and buyers.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {partnerSegments.map((segment) => (
                        <div key={segment.title} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-emerald-300/[0.045]">
                            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/15 bg-emerald-300/10 text-emerald-300">
                                <segment.icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-serif text-2xl font-semibold text-white">{segment.title}</h3>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-400">{segment.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FarmerNetwork() {
    return (
        <section className="relative bg-[#020303] py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.08),transparent_34%)]" />
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-8 md:p-10">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/15 bg-emerald-300/10 text-emerald-300">
                            <Leaf className="h-6 w-6" />
                        </div>
                        <h2 className="font-serif text-4xl font-semibold leading-tight text-white md:text-5xl">
                            Better demand for farmers. Better freshness for buyers.
                        </h2>
                        <p className="mt-6 text-lg font-light leading-relaxed text-zinc-400">
                            We position Fresh Pick as the coordination layer between Sri Lankan growers, restaurants, hotels, offices, and households. That means clearer demand, less waste, and more consistent access to quality produce.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            "Seasonal harvest planning",
                            "Grower and supplier coordination",
                            "Restaurant prep-focused selection",
                            "Household recurring basket support",
                        ].map((item) => (
                            <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-6 text-zinc-300">
                                <ShieldCheck className="mb-5 h-5 w-5 text-emerald-300" />
                                <p className="font-medium">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function OperatingModel() {
    return (
        <section className="bg-[#050606] py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-14 max-w-3xl">
                    <span className="mb-5 block text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">How it works</span>
                    <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                        A premium supply flow with simple operational rules.
                    </h2>
                </div>

                <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 md:grid-cols-4">
                    {operatingModel.map((item) => (
                        <div key={item.title} className="bg-[#080a09] p-8">
                            <item.icon className="mb-8 h-6 w-6 text-emerald-300" />
                            <h3 className="font-serif text-2xl font-semibold text-white">{item.title}</h3>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-400">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ServiceAreaSection() {
    return (
        <section className="border-y border-white/5 bg-[#020303] py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                    <div>
                        <span className="mb-5 block text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Colombo delivery coverage</span>
                        <h2 className="font-serif text-4xl font-semibold text-white md:text-5xl">Local supply, planned around your area.</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {serviceAreas.map((area) => (
                            <span key={area} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-zinc-300">
                                {area}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ConciergeSection() {
    return (
        <section id="apply" className="relative bg-[#050606] py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="grid lg:grid-cols-2">
                        <div className="relative min-h-[520px] p-8 md:p-12 lg:p-16">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_36%)]" />
                            <div className="relative z-10 flex h-full flex-col justify-between gap-16">
                                <div>
                                    <span className="mb-6 block text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Partnership request</span>
                                    <h3 className="font-serif text-5xl font-semibold leading-tight text-white md:text-6xl">Build your supply plan</h3>
                                    <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-zinc-400">
                                        Tell us whether you are buying for a restaurant, hotel, office, farm supply partnership, or household plan. We will shape the recurring basket around your needs.
                                    </p>
                                </div>
                                <div className="space-y-6 text-sm text-zinc-400">
                                    <div className="border-l border-emerald-300/30 pl-5">
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">Direct Email</div>
                                        <a href="mailto:b2b@freshpick.lk" className="text-lg text-white transition-colors hover:text-emerald-300">b2b@freshpick.lk</a>
                                    </div>
                                    <div className="border-l border-emerald-300/30 pl-5">
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">Typical plans</div>
                                        Daily kitchens • Weekly households • Office pantry supply • Farmer sourcing partnerships
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 bg-black/30 p-8 md:p-12 lg:border-l lg:border-t-0 lg:p-16">
                            <form className="space-y-7" action="mailto:b2b@freshpick.lk" method="post" encType="text/plain">
                                <div>
                                    <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Business or household name</label>
                                    <input name="name" type="text" className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-emerald-300/60" placeholder="e.g. restaurant, office, villa, household" />
                                </div>
                                <div className="grid gap-7 md:grid-cols-2">
                                    <div>
                                        <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Contact person</label>
                                        <input name="contact" type="text" className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-emerald-300/60" placeholder="Full name" />
                                    </div>
                                    <div>
                                        <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Phone</label>
                                        <input name="phone" type="tel" className="w-full border-b border-white/10 bg-transparent py-3 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-emerald-300/60" placeholder="+94..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Requirement</label>
                                    <textarea name="requirement" rows={4} className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-emerald-300/60" placeholder="Tell us your weekly volume, delivery area, produce categories, or farmer partnership interest." />
                                </div>
                                <button type="submit" className="group flex h-14 w-full items-center justify-center rounded-full bg-emerald-300 px-8 text-sm font-bold uppercase tracking-[0.18em] text-zinc-950 transition-all duration-300 hover:bg-emerald-200">
                                    Request review
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
