import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin, Sparkles } from "lucide-react";

const quickLinks = [
    { label: "Fresh groceries", href: "/products" },
    { label: "Ready meals", href: "/meals" },
    { label: "Local makers", href: "/homemade" },
];

export default function HeroSection() {
    return (
        <section className="relative flex min-h-[88svh] items-end overflow-hidden bg-[#07110c] text-white md:min-h-[92vh]">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bgs/home-hero.jpg"
                    alt="Fresh vegetables and groceries delivered in Colombo"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-75"
                    priority
                    fetchPriority="high"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07110c]/95 via-[#07110c]/[0.64] to-[#07110c]/[0.15]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-[#07110c]/10 to-black/35" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,183,0.12),transparent_30%),radial-gradient(circle_at_82%_70%,rgba(255,255,255,0.08),transparent_25%)]" />
            </div>

            <div className="container relative z-10 mx-auto max-w-[1600px] px-5 pb-8 pt-32 md:px-10 md:pb-12 lg:px-16 lg:pb-16">
                <div className="grid items-end gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="animate-fade-up">
                        <div className="mb-7 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-100 backdrop-blur-md">
                                <Sparkles className="h-3.5 w-3.5" /> Curated in Colombo
                            </span>
                            <span className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/[0.55] sm:inline-flex">
                                <MapPin className="h-3.5 w-3.5" /> FreshPick · Sri Lanka
                            </span>
                        </div>

                        <h1 className="max-w-5xl text-balance font-serif text-[3.6rem] font-normal leading-[0.9] tracking-[-0.045em] text-white sm:text-7xl md:text-8xl lg:text-[7.4rem]">
                            Food worth looking<br className="hidden sm:block" /> forward <span className="italic text-emerald-200">to.</span>
                        </h1>

                        <div className="mt-8 grid max-w-5xl gap-7 lg:grid-cols-[minmax(0,600px)_auto] lg:items-end">
                            <p className="max-w-2xl text-base font-light leading-7 text-white/[0.72] md:text-lg md:leading-8">
                                Fresh groceries, independent Sri Lankan makers, prepared meals, and recurring delivery — brought together in one beautifully simple food shop.
                            </p>

                            <div className="flex flex-wrap gap-3 lg:justify-end">
                                <Link
                                    prefetch={false}
                                    href="/products"
                                    className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-[#07110c] shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
                                >
                                    Shop FreshPick
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    prefetch={false}
                                    href="/subscriptions"
                                    className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md transition-all hover:border-emerald-200/60 hover:bg-white/[0.14]"
                                >
                                    <CalendarClock className="h-4 w-4" /> Recurring delivery
                                </Link>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-2 border-t border-white/[0.12] pt-6">
                            <span className="mr-2 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Explore</span>
                            {quickLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={false}
                                    className="rounded-full border border-white/[0.12] bg-black/10 px-4 py-2 text-xs text-white/75 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <aside className="hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.08] p-7 backdrop-blur-xl xl:block">
                        <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-emerald-200">FreshPick promise</span>
                        <p className="mt-5 font-serif text-3xl font-normal leading-tight text-white">Better food shopping, without the supermarket feeling.</p>
                        <div className="mt-7 space-y-4 border-t border-white/[0.12] pt-6 text-sm font-light text-white/65">
                            <div className="flex items-center justify-between gap-4"><span>One-time orders</span><span className="text-white">Available</span></div>
                            <div className="flex items-center justify-between gap-4"><span>Recurring baskets</span><span className="text-white">Flexible</span></div>
                            <div className="flex items-center justify-between gap-4"><span>Local makers</span><span className="text-white">Curated</span></div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
