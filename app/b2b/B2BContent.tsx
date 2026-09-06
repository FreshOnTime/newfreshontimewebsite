import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    Handshake,
    Leaf,
    PackageCheck,
    SearchCheck,
    Sprout,
    Store,
    Truck,
    UsersRound,
} from "lucide-react";
import PartnershipRequestForm from "./PartnershipRequestForm";

const partnerTypes = [
    {
        icon: Sprout,
        label: "Growers & farms",
        title: "Bring exceptional produce closer to customers.",
        description: "Fruit, vegetables, herbs, eggs, dairy, and other fresh categories from growers who care about quality, consistency, and responsible handling.",
    },
    {
        icon: Store,
        label: "Local makers",
        title: "Give thoughtful food products a stronger shelf.",
        description: "Small-batch food, bakery, pantry, ready-to-eat, and specialty products from independent Sri Lankan makers and emerging brands.",
    },
    {
        icon: PackageCheck,
        label: "Brands & distributors",
        title: "Join a more curated route to market.",
        description: "Established producers, distributors, and importers with products that fit the FreshPick assortment and service promise.",
    },
    {
        icon: Building2,
        label: "Business partners",
        title: "Build supply relationships beyond retail.",
        description: "Restaurants, hotels, offices, caterers, and other organisations looking for recurring supply, sourcing support, or strategic collaboration.",
    },
];

const benefits = [
    {
        icon: UsersRound,
        title: "Reach the right customers",
        description: "FreshPick presents products inside a curated food experience instead of burying them inside an open marketplace.",
    },
    {
        icon: SearchCheck,
        title: "Better product discovery",
        description: "Strong product presentation, category placement, storytelling, search, and merchandising help good products stand out.",
    },
    {
        icon: Handshake,
        title: "A direct partnership",
        description: "Commercial terms, assortment, availability, and operating expectations are agreed with the FreshPick team during onboarding.",
    },
    {
        icon: Truck,
        title: "A clearer operating rhythm",
        description: "We align on fulfilment, delivery, packaging, lead times, and supply consistency before products go live.",
    },
];

const onboardingSteps = [
    {
        number: "01",
        title: "Tell us what you supply",
        description: "Share your company, farm, brand, product categories, current capacity, and where you operate.",
    },
    {
        number: "02",
        title: "FreshPick reviews the fit",
        description: "We assess assortment fit, customer relevance, quality, consistency, availability, and operational readiness.",
    },
    {
        number: "03",
        title: "Quality & commercial review",
        description: "Where relevant, we review samples, pricing, packaging, fulfilment expectations, documentation, and supply terms.",
    },
    {
        number: "04",
        title: "Set up the partnership",
        description: "Approved partners align with FreshPick on catalogue information, ordering, inventory, delivery, support, and launch readiness.",
    },
    {
        number: "05",
        title: "Launch & improve together",
        description: "Products or supply relationships go live, with assortment, availability, and performance refined over time.",
    },
];

const standards = [
    "Consistent product quality",
    "Reliable availability and lead times",
    "Clear origin and product information",
    "Safe handling, packaging, and storage",
    "Commercially sustainable pricing",
    "Responsive communication",
];

export default function B2BContent() {
    return (
        <div className="overflow-hidden bg-white text-zinc-950 selection:bg-emerald-200 selection:text-zinc-950">
            <HeroSection />
            <PartnershipTypes />
            <CuratedModel />
            <PartnerBenefits />
            <OnboardingProcess />
            <StandardsSection />
            <BusinessPartnerships />
            <ApplySection />
        </div>
    );
}

function HeroSection() {
    return (
        <section className="relative isolate overflow-hidden bg-[#07110c] text-white">
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2200&auto=format&fit=crop"
                    alt="FreshPick supplier partnerships with farms, makers, and food producers"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07110c]/98 via-[#07110c]/83 to-[#07110c]/42" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-transparent to-black/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,183,0.16),transparent_30%)]" />
            </div>

            <div className="container relative z-10 mx-auto max-w-[1500px] px-5 pb-16 pt-36 md:px-8 md:pb-20 md:pt-44 lg:px-12 lg:pb-24">
                <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="max-w-5xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-100 backdrop-blur-md">
                            <Handshake className="h-3.5 w-3.5" /> FreshPick partnerships
                        </span>
                        <h1 className="mt-8 text-balance font-serif text-[3.7rem] font-normal leading-[0.88] tracking-[-0.045em] text-white sm:text-7xl md:text-8xl lg:text-[7rem]">
                            Grow with<br />
                            <span className="italic text-emerald-200">FreshPick.</span>
                        </h1>
                        <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/72 md:text-xl">
                            We partner with selected growers, food makers, producers, distributors, and business operators who can help us build a better food experience for Sri Lanka.
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="#apply"
                                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-[#07110c] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
                            >
                                Become a supplier
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="#business-partnerships"
                                className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/8 px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md transition-colors hover:bg-white/14"
                            >
                                Business partnerships
                            </Link>
                        </div>
                    </div>

                    <aside className="rounded-[2rem] border border-white/12 bg-white/[0.08] p-7 backdrop-blur-xl">
                        <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-emerald-200">Our model</span>
                        <h2 className="mt-5 font-serif text-3xl font-normal leading-tight">Curated partnerships, not an open marketplace.</h2>
                        <p className="mt-5 text-sm font-light leading-7 text-white/65">
                            Every supplier relationship is reviewed for product fit, quality, consistency, commercial suitability, and the customer experience FreshPick wants to protect.
                        </p>
                        <div className="mt-6 border-t border-white/12 pt-5 text-sm text-white/70">
                            <div className="flex items-center gap-3"><BadgeCheck className="h-4 w-4 text-emerald-200" /> Reviewed before onboarding</div>
                            <div className="mt-3 flex items-center gap-3"><Leaf className="h-4 w-4 text-emerald-200" /> Quality-led assortment</div>
                            <div className="mt-3 flex items-center gap-3"><Handshake className="h-4 w-4 text-emerald-200" /> Direct commercial relationship</div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}

function PartnershipTypes() {
    return (
        <section className="bg-[#f6f7f4] py-24 md:py-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                <div className="mb-14 grid gap-8 md:grid-cols-[1fr_0.72fr] md:items-end">
                    <div>
                        <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">Who we partner with</span>
                        <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight md:text-7xl">
                            Great food businesses begin with <span className="italic text-emerald-900">great partners.</span>
                        </h2>
                    </div>
                    <p className="max-w-lg text-base font-light leading-8 text-zinc-600 md:justify-self-end">
                        FreshPick is building a selective network across fresh produce, local food, packaged products, distribution, hospitality, and institutional supply.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {partnerTypes.map((partner, index) => (
                        <article key={partner.label} className="group rounded-[2rem] border border-zinc-200/80 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.07)] md:p-9">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                                    <partner.icon className="h-5 w-5" />
                                </div>
                                <span className="font-serif text-sm italic text-emerald-700">0{index + 1}</span>
                            </div>
                            <span className="mt-9 block text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-400">{partner.label}</span>
                            <h3 className="mt-3 max-w-xl font-serif text-3xl font-normal leading-tight text-zinc-950 md:text-4xl">{partner.title}</h3>
                            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-zinc-600">{partner.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CuratedModel() {
    return (
        <section className="bg-white py-24 md:py-32">
            <div className="container mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="relative min-h-[480px] overflow-hidden rounded-[2.25rem] bg-zinc-100 md:min-h-[600px]">
                    <Image
                        src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=1600&auto=format&fit=crop"
                        alt="Fresh vegetables selected for a curated FreshPick supplier partnership"
                        fill
                        sizes="(max-width: 1024px) 100vw, 48vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 max-w-md p-7 text-white md:p-9">
                        <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/60">FreshPick standard</span>
                        <p className="mt-4 font-serif text-3xl leading-tight">Fewer, better partners. Better products for customers.</p>
                    </div>
                </div>

                <div className="lg:pl-8">
                    <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">A curated supplier network</span>
                    <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight md:text-7xl">
                        We are building a brand, <span className="italic text-emerald-900">not a listing directory.</span>
                    </h2>
                    <p className="mt-7 max-w-xl text-base font-light leading-8 text-zinc-600 md:text-lg">
                        FreshPick does not automatically list every supplier that applies. We choose products and partnerships that strengthen the assortment, solve a real customer need, and can be delivered consistently.
                    </p>
                    <div className="mt-8 space-y-4 border-t border-zinc-200 pt-7">
                        {[
                            "Assortment is reviewed before launch",
                            "Quality and operational standards matter as much as price",
                            "Supplier terms are agreed directly with FreshPick",
                            "Partners remain responsible for accurate product and supply information",
                        ].map((item) => (
                            <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function PartnerBenefits() {
    return (
        <section className="border-y border-zinc-200 bg-[#07110c] py-24 text-white md:py-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                <div className="mb-14 max-w-4xl">
                    <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200">Why partner with FreshPick</span>
                    <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] md:text-7xl">
                        More than shelf space. A better <span className="italic text-emerald-200">route to customers.</span>
                    </h2>
                </div>
                <div className="grid gap-px overflow-hidden rounded-[2rem] bg-white/10 md:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit) => (
                        <article key={benefit.title} className="min-h-[300px] bg-[#0b1711] p-7 md:p-8">
                            <benefit.icon className="h-5 w-5 text-emerald-200" />
                            <h3 className="mt-16 font-serif text-3xl font-normal leading-tight">{benefit.title}</h3>
                            <p className="mt-5 text-sm font-light leading-7 text-white/58">{benefit.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function OnboardingProcess() {
    return (
        <section className="bg-white py-24 md:py-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                <div className="mb-14 grid gap-8 md:grid-cols-[1fr_0.7fr] md:items-end">
                    <div>
                        <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">Supplier onboarding</span>
                        <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] md:text-7xl">
                            From introduction to <span className="italic text-emerald-900">launch.</span>
                        </h2>
                    </div>
                    <p className="max-w-lg text-base font-light leading-8 text-zinc-600 md:justify-self-end">
                        The process is deliberately simple, but approval is selective. The exact review can vary depending on the type of product or partnership.
                    </p>
                </div>

                <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                    {onboardingSteps.map((step) => (
                        <article key={step.number} className="grid gap-5 py-7 md:grid-cols-[90px_0.8fr_1.2fr] md:items-center md:py-9">
                            <span className="font-serif text-3xl italic text-emerald-700">{step.number}</span>
                            <h3 className="font-serif text-2xl font-normal text-zinc-950 md:text-3xl">{step.title}</h3>
                            <p className="max-w-xl text-sm font-light leading-7 text-zinc-600 md:justify-self-end">{step.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function StandardsSection() {
    return (
        <section className="bg-[#f6f7f4] py-24 md:py-28">
            <div className="container mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[0.75fr_1.25fr]">
                <div>
                    <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">What we look for</span>
                    <h2 className="font-serif text-5xl font-normal leading-[0.96] md:text-6xl">Partnerships built to <span className="italic text-emerald-900">last.</span></h2>
                    <p className="mt-6 max-w-md text-sm font-light leading-7 text-zinc-600">
                        Requirements vary by category, but these are the fundamentals behind a strong FreshPick supplier relationship.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {standards.map((standard) => (
                        <div key={standard} className="flex min-h-24 items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-zinc-800">{standard}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function BusinessPartnerships() {
    return (
        <section id="business-partnerships" className="bg-white py-24 md:py-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                <div className="overflow-hidden rounded-[2.25rem] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="p-8 md:p-12 lg:p-14">
                            <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">Beyond supplier onboarding</span>
                            <h2 className="max-w-3xl font-serif text-5xl font-normal leading-[0.96] md:text-6xl">
                                Looking for a broader <span className="italic text-emerald-900">business partnership?</span>
                            </h2>
                            <p className="mt-7 max-w-xl text-base font-light leading-8 text-zinc-600">
                                FreshPick can also explore recurring supply relationships, restaurant and hotel procurement, office pantry programs, sourcing collaborations, food launches, and other strategic partnerships.
                            </p>
                            <Link href="#apply" className="group mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-950 hover:text-emerald-700">
                                Start a partnership conversation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="relative min-h-[380px] bg-zinc-100 lg:min-h-full">
                            <Image
                                src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1400&auto=format&fit=crop"
                                alt="FreshPick business food supply and partnership collaboration"
                                fill
                                sizes="(max-width: 1024px) 100vw, 45vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-transparent to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ApplySection() {
    return (
        <section id="apply" className="bg-[#07110c] py-24 text-white md:py-32">
            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div className="lg:sticky lg:top-28">
                        <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200">Start here</span>
                        <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] md:text-7xl">
                            Tell us what you can <span className="italic text-emerald-200">bring to FreshPick.</span>
                        </h2>
                        <p className="mt-7 max-w-lg text-base font-light leading-8 text-white/62">
                            Share enough detail for us to understand the opportunity. If there is a strong fit, the FreshPick team can continue the supplier or partnership review directly with you.
                        </p>
                        <div className="mt-9 space-y-4 border-t border-white/12 pt-7 text-sm text-white/65">
                            <div className="flex items-center gap-3"><Leaf className="h-4 w-4 text-emerald-200" /> Farms, growers, and fresh produce</div>
                            <div className="flex items-center gap-3"><PackageCheck className="h-4 w-4 text-emerald-200" /> Makers, brands, and distributors</div>
                            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-emerald-200" /> Restaurants, hotels, offices, and strategic partners</div>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
                        <PartnershipRequestForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
