import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative flex min-h-[94vh] items-end overflow-hidden bg-[#06100c] text-white">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bgs/home-hero.jpg"
                    alt="Fresh vegetables and groceries delivered in Colombo"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-70"
                    priority
                    fetchPriority="high"
                    // The source image is already a small, production-ready JPG.
                    // Serving it directly avoids a cold Next image-optimization
                    // function before the above-the-fold content can paint.
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#06100c]/95 via-[#06100c]/60 to-black/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06100c] via-transparent to-black/45" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,189,122,0.08),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(255,255,255,0.05),transparent_28%)]" />
            </div>

            <div className="container relative z-10 mx-auto px-5 pb-16 md:px-10 md:pb-20 lg:px-16 lg:pb-24">
                <div className="grid items-end gap-12 lg:grid-cols-[1fr_300px]">
                    <div className="animate-fade-up">
                        <span className="mb-8 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.36em] text-[#d8bd7a]">
                            <span className="h-px w-10 bg-[#d8bd7a]/70" /> Colombo · Est. 2024
                        </span>
                        <h1 className="max-w-5xl font-serif text-6xl font-normal leading-[0.86] tracking-[-0.04em] text-[#faf7ef] md:text-8xl lg:text-[7.8rem]">
                            A more considered<br />way to <span className="italic text-emerald-200">eat.</span>
                        </h1>
                        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end">
                            <p className="max-w-xl text-base font-light leading-8 text-white/70 md:text-lg">
                                Exceptional produce, local makers, prepared meals, and recurring delivery—curated for Colombo’s most discerning tables.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link prefetch={false} href="/products" className="group inline-flex h-14 items-center gap-3 bg-[#f5f0e5] px-7 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0c1711] transition-colors hover:bg-white">
                                    Enter the collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link prefetch={false} href="/subscriptions" className="inline-flex h-14 items-center border border-white/25 px-7 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-[#d8bd7a] hover:text-[#ead69f]">
                                    Weekly curation
                                </Link>
                            </div>
                        </div>
                    </div>

                    <aside className="hidden border-l border-white/15 pl-8 lg:block">
                        <ArrowDownRight className="h-5 w-5 text-[#d8bd7a]" />
                        <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">Private food house</p>
                        <p className="mt-4 font-serif text-2xl font-normal leading-snug text-white/90">From harvest to table, every detail considered.</p>
                    </aside>
                </div>
            </div>
        </section>
    );
}
