import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Home, Sprout, Truck, Utensils } from "lucide-react";

const partnerSegments = [
    {
        label: "01 / Kitchens",
        icon: Utensils,
        title: "Restaurants & cloud kitchens",
        description: "Chef-ready vegetables, herbs, fruit, dairy, and pantry essentials planned around prep cycles.",
    },
    {
        label: "02 / Hospitality",
        icon: Building2,
        title: "Hotels, cafes & offices",
        description: "Recurring supply for breakfast spreads, staff meals, boardrooms, and event operations.",
    },
    {
        label: "03 / Homes",
        icon: Home,
        title: "Premium households",
        description: "Weekly household baskets for families, apartments, villas, and private residences.",
    },
    {
        label: "04 / Growers",
        icon: Sprout,
        title: "Farmer sourcing network",
        description: "Cleaner demand planning between growers and buyers to reduce waste and protect quality.",
    },
];

const processCards = [
    {
        number: "01",
        tag: "Sourcing",
        title: "Farm & supplier planning",
        description: "Trusted farms, regional suppliers, and seasonal availability mapped before fulfilment.",
    },
    {
        number: "02",
        tag: "Selection",
        title: "Picked for use case",
        description: "Orders selected by freshness, ripeness, size, shelf-life, and kitchen or household needs.",
    },
    {
        number: "03",
        tag: "Rhythm",
        title: "Recurring supply cycles",
        description: "Daily, weekly, or custom plans for kitchens, offices, villas, and premium households.",
    },
    {
        number: "04",
        tag: "Support",
        title: "One supply conversation",
        description: "Adjustments, special items, recurring baskets, and seasonal sourcing handled simply.",
    },
];

const serviceAreas = ["Colombo", "Rajagiriya", "Battaramulla", "Nawala", "Nugegoda", "Dehiwala", "Mount Lavinia", "Kollupitiya", "Bambalapitiya"];

export default function B2BContent() {
    return (
        <div className="overflow-hidden bg-[#fbfaf6] text-zinc-950 selection:bg-emerald-300 selection:text-zinc-950">
            <HeroSection />
            <PartnerSegments />
            <EditorialSection />
            <SupplySystem />
            <ServiceAreaSection />
            <ConciergeSection />
        </div>
    );
}

function HeroSection() {
    return (
        <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-zinc-950 text-white">
            <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                alt="Fresh produce supply for restaurants, hotels, households and farmers"
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-[#fbfaf6]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.2),transparent_34%)]" />

            <div className="container relative z-10 mx-auto max-w-5xl px-4 pt-20 text-center">
                <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
                    Fresh Pick Supply Network
                </span>
                <h1 className="mt-8 font-serif text-6xl font-medium leading-[0.88] tracking-tight text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
                    Produce supply,<br />
                    <span className="italic text-emerald-100">curated.</span>
                </h1>
                <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-relaxed text-zinc-100 drop-shadow-md md:text-2xl">
                    Premium fresh produce procurement for Colombo restaurants, hotels, offices, farmer partnerships, and private households.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="#apply" className="group rounded-full bg-white px-8 py-4 font-bold text-zinc-950 shadow-[0_20px_50px_rgba(255,255,255,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50">
                        <span className="flex items-center gap-2">
                            Request a supply plan
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Link>
                    <Link href="/products" className="rounded-full border border-white/25 bg-white/5 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                        Explore products
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PartnerSegments() {
    return (
        <section className="relative z-20 -mt-24 pb-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto grid max-w-[1400px] grid-cols-1 border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(9,14,12,0.12)] md:grid-cols-2 lg:grid-cols-4">
                    {partnerSegments.map((segment) => (
                        <div key={segment.title} className="group min-h-[250px] border-b border-zinc-200 bg-gradient-to-b from-white to-[#fbfaf6] p-8 transition-all duration-300 hover:bg-white md:border-r lg:border-b-0">
                            <div className="mb-8 flex items-center justify-between gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-900">{segment.label}</span>
                                <segment.icon className="h-5 w-5 text-emerald-800/60" />
                            </div>
                            <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-zinc-950">
                                {segment.title}
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                                {segment.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function EditorialSection() {
    return (
        <section className="bg-[#fbfaf6] pb-28 pt-8">
            <div className="container mx-auto grid max-w-7xl items-center gap-16 px-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[520px] md:min-h-[640px]">
                    <div className="absolute inset-y-0 left-0 right-16 overflow-hidden bg-zinc-100 shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
                        <Image
                            src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=1200&auto=format&fit=crop"
                            alt="Fresh harvested vegetables prepared for supply"
                            fill
                            sizes="(max-width: 1024px) 100vw, 48vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute bottom-16 right-0 h-[320px] w-[240px] overflow-hidden border-[12px] border-[#fbfaf6] bg-zinc-100 shadow-[0_24px_70px_rgba(0,0,0,0.14)] md:h-[360px] md:w-[270px]">
                        <Image
                            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200&auto=format&fit=crop"
                            alt="Farmer direct produce sourcing for Fresh Pick"
                            fill
                            sizes="270px"
                            className="object-cover"
                        />
                    </div>
                </div>

                <div>
                    <span className="mb-6 block text-xs font-black uppercase tracking-[0.24em] text-emerald-900">From growers to tables</span>
                    <h2 className="font-serif text-5xl font-medium leading-[0.96] tracking-tight text-zinc-950 md:text-7xl">
                        A cleaner supply line for <span className="italic text-emerald-900">better freshness.</span>
                    </h2>
                    <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-zinc-500">
                        Fresh Pick becomes the coordination layer between Sri Lankan growers, restaurants, hotels, offices, and homes. We plan demand, select the right harvest, and build repeat delivery rhythms that reduce last-minute buying and inconsistent stock.
                    </p>
                    <div className="mt-10 grid gap-5 sm:grid-cols-3">
                        {[
                            { value: "Daily", label: "Kitchen top-ups" },
                            { value: "Weekly", label: "Home plans" },
                            { value: "Local", label: "Grower network" },
                        ].map((item) => (
                            <div key={item.label} className="border-t border-zinc-200 pt-5">
                                <strong className="block font-serif text-4xl font-medium text-zinc-950">{item.value}</strong>
                                <span className="mt-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function SupplySystem() {
    return (
        <section className="border-y border-zinc-200 bg-white py-28">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="mb-16 grid items-end gap-10 lg:grid-cols-[1.05fr_0.85fr]">
                    <div>
                        <span className="mb-6 block text-xs font-black uppercase tracking-[0.24em] text-emerald-900">The operating model</span>
                        <h2 className="max-w-4xl text-balance font-serif text-5xl font-medium leading-[0.96] tracking-tight text-zinc-950 md:text-7xl">
                            Reliable supply without making procurement feel <span className="italic text-emerald-900">complicated.</span>
                        </h2>
                    </div>
                    <p className="max-w-md text-lg font-light leading-relaxed text-zinc-500">
                        A calmer premium section with white space, refined process cards, and one image-led concierge panel for contrast.
                    </p>
                </div>

                <div className="grid gap-7 lg:grid-cols-[1fr_390px]">
                    <div className="grid gap-5 md:grid-cols-2">
                        {processCards.map((card) => (
                            <div key={card.number} className="flex min-h-[220px] flex-col justify-between border border-zinc-200 bg-[#fbfaf6] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
                                <div className="flex items-center justify-between gap-5">
                                    <span className="font-serif text-4xl font-medium leading-none text-amber-600">{card.number}</span>
                                    <span className="rounded-full border border-emerald-900/15 bg-emerald-900/[0.05] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-900">
                                        {card.tag}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="mt-8 font-serif text-3xl font-medium leading-tight tracking-tight text-zinc-950">
                                        {card.title}
                                    </h3>
                                    <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="relative min-h-[458px] overflow-hidden bg-zinc-950 p-9 text-white shadow-[0_28px_70px_rgba(0,0,0,0.18)]">
                        <Image
                            src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1200&auto=format&fit=crop"
                            alt="Fresh Pick concierge supply desk for recurring produce plans"
                            fill
                            sizes="(max-width: 1024px) 100vw, 390px"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/75" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_35%)]" />
                        <div className="relative z-10 flex h-full flex-col justify-end">
                            <span className="mb-5 block text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100">Concierge supply desk</span>
                            <h3 className="font-serif text-4xl font-medium leading-[0.98] tracking-tight text-white">
                                A human layer for every recurring plan.
                            </h3>
                            <p className="mt-5 text-sm leading-relaxed text-white/75">
                                Built for restaurants, households, offices, and farmers who need consistency, not random ordering.
                            </p>
                            <Link href="#apply" className="mt-7 inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-950 transition-colors hover:bg-emerald-50">
                                Build your plan
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}

function ServiceAreaSection() {
    return (
        <section className="bg-[#fbfaf6] py-20">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid items-center gap-10 border-y border-zinc-200 py-12 lg:grid-cols-[0.75fr_1.25fr]">
                    <div>
                        <span className="mb-5 block text-xs font-black uppercase tracking-[0.24em] text-emerald-900">Colombo delivery coverage</span>
                        <h2 className="font-serif text-4xl font-medium tracking-tight text-zinc-950 md:text-5xl">Local supply, planned around your area.</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {serviceAreas.map((area) => (
                            <span key={area} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
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
        <section id="apply" className="bg-[#fbfaf6] pb-28 pt-4">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="relative overflow-hidden bg-[#050606] p-8 text-white shadow-[0_30px_90px_rgba(5,6,6,0.2)] md:p-14 lg:p-16">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%)]" />
                    <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                        <div>
                            <span className="mb-6 block text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Partnership request</span>
                            <h2 className="font-serif text-5xl font-medium leading-[0.98] tracking-tight text-white md:text-7xl">
                                Build your weekly supply plan.
                            </h2>
                            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/65">
                                Tell us whether you are buying for a restaurant, hotel, office, farm partnership, or private home. We shape the basket around your volume, delivery area, and quality expectations.
                            </p>
                            <div className="mt-10 flex items-center gap-3 text-sm text-white/55">
                                <Truck className="h-5 w-5 text-emerald-200" />
                                Daily kitchens, weekly households, office pantry supply, and farmer sourcing partnerships.
                            </div>
                        </div>

                        <form className="bg-white p-8 text-zinc-950 md:p-10" action="mailto:b2b@freshpick.lk" method="post" encType="text/plain">
                            <div className="space-y-2">
                                <InputLike label="Business or household name" name="name" placeholder="e.g. restaurant, office, villa, household" />
                                <InputLike label="Contact person" name="contact" placeholder="Full name" />
                                <InputLike label="Phone number" name="phone" placeholder="+94..." />
                                <div>
                                    <label className="sr-only" htmlFor="requirement">Requirement</label>
                                    <textarea id="requirement" name="requirement" rows={4} className="w-full resize-none border-b border-zinc-200 bg-transparent py-5 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-emerald-700" placeholder="Weekly volume, delivery area, produce categories, or farmer partnership interest" />
                                </div>
                            </div>
                            <button type="submit" className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-emerald-400 px-8 text-sm font-black uppercase tracking-[0.18em] text-zinc-950 transition-colors hover:bg-emerald-300">
                                Request review
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InputLike({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
    return (
        <div>
            <label className="sr-only" htmlFor={name}>{label}</label>
            <input id={name} name={name} type="text" className="w-full border-b border-zinc-200 bg-transparent py-5 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-emerald-700" placeholder={placeholder} />
        </div>
    );
}
