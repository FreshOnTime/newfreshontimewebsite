"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/home/AnimatedSection";

export default function B2BPage() {
    return (
        <div className="relative bg-white text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-clip">
            {/* Hero Section - Cinematic */}
            <HeroSection />

            {/* Philosophy - Clean Light */}
            <PhilosophySection />

            {/* Collection - Premium Grid */}
            <CollectionGrid />

            {/* Concierge - distinctive contact section */}
            <ConciergeSection />
        </div>
    );
}

// --- Sections ---

function HeroSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="relative h-[80vh] flex items-center justify-center overflow-hidden z-10 bg-zinc-950">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <motion.div style={{ y, opacity }} className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=2664&auto=format&fit=crop"
                        alt="Background"
                        fill
                        className="object-cover opacity-40 grayscale"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/50 to-zinc-950" />
                </motion.div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center items-center text-center">
                <div className="space-y-12 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                    >
                        <span className="inline-flex items-center gap-3 border-y border-emerald-500/30 py-2 px-1 text-emerald-500 text-xs md:text-sm tracking-[0.3em] uppercase font-bold">
                            Private Client Division
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-none"
                    >
                        The Supply Chain <br />
                        <span className="text-zinc-500 italic">Perfected.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-xl md:text-2xl font-light text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        The invisible hand behind Colombo&apos;s most celebrated dining experiences. A closed-loop procurement network dedicated to absolute perfection.
                    </motion.p>
                </div>
            </div>
        </section>
    );
}

function PhilosophySection() {
    return (
        <section className="relative z-20 py-32 container mx-auto px-4 bg-white border-b border-zinc-100">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <span className="text-emerald-900 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">The Methodology</span>
                    <h2 className="font-serif text-4xl md:text-6xl text-zinc-900 leading-[1.1] max-w-4xl">
                        A rigorous, military-grade procurement infrastructure disguised as a simple delivery service.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-x-12 gap-y-16">
                    <div className="space-y-6">
                        <span className="text-5xl font-serif text-zinc-200">01</span>
                        <h3 className="text-xl font-bold tracking-wide uppercase text-zinc-900 border-t border-zinc-900 pt-6">Global & Domestic Sourcing</h3>
                        <p className="text-zinc-500 font-light leading-relaxed text-lg">
                            We maintain direct contracts with elite growers spanning 4 climate zones. From Nuwara Eliya's frost-kissed peaks to the arid purity of the Northern dry zone, we source strictly by terroir. If it&apos;s not peak season, we don&apos;t carry it.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <span className="text-5xl font-serif text-zinc-900">02</span>
                        <h3 className="text-xl font-bold tracking-wide uppercase text-zinc-900 border-t border-zinc-900 pt-6">Triple-Check Calibration</h3>
                        <p className="text-zinc-500 font-light leading-relaxed text-lg">
                            Every single unit undergoes a 3-stage manual inspection. Size calibration, color grading, and blemish filtration. What reaches your kitchen door is not just produce; it is a curated selection of nature&apos;s statistical outliers—the top 1% of the harvest.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <span className="text-5xl font-serif text-zinc-200">03</span>
                        <h3 className="text-xl font-bold tracking-wide uppercase text-zinc-900 border-t border-zinc-900 pt-6">Unbroken Cold Chain</h3>
                        <p className="text-zinc-500 font-light leading-relaxed text-lg">
                            From harvest to handover, your order never exceeds 4°C. Our proprietary logistics fleet is temperature-monitored in real-time. We don&apos;t just deliver ingredients; we deliver shelf-life magnitude and arrested decay.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CollectionGrid() {
    return (
        <section className="relative bg-zinc-50 z-20 py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto mb-20 text-center">
                    <span className="text-emerald-900 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">The Private Office</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 mb-8">
                        Service Beyond Delivery
                    </h2>
                    <p className="text-xl text-zinc-500 font-light leading-relaxed">
                        Membership grants you access to an operational extension of your own team.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
                    <div className="bg-white p-12 hover:bg-zinc-50 transition-colors">
                        <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 mb-4">Dedicated Account Manager</h3>
                        <p className="text-zinc-500 font-light text-sm leading-relaxed">
                            A single point of contact available 24/7. No call centers. No tickets. Just a direct line to a specialist who knows your menu.
                        </p>
                    </div>
                    <div className="bg-white p-12 hover:bg-zinc-50 transition-colors">
                        <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 mb-4">Priority Logistics</h3>
                        <p className="text-zinc-500 font-light text-sm leading-relaxed">
                            First-out delivery slots. Emergency procurement runs. Your kitchen&apos;s urgency becomes our operational priority.
                        </p>
                    </div>
                    <div className="bg-white p-12 hover:bg-zinc-50 transition-colors">
                        <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 mb-4">Custom Procurement</h3>
                        <p className="text-zinc-500 font-light text-sm leading-relaxed">
                            Need White Asparagus from Jaffna? Or specific micro-basil stems? We activate our scout network to find exactly what you need.
                        </p>
                    </div>
                    <div className="bg-white p-12 hover:bg-zinc-50 transition-colors">
                        <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 mb-4">Fiscal Advantages</h3>
                        <p className="text-zinc-500 font-light text-sm leading-relaxed">
                            Consolidated monthly billing. Net-30 terms for qualified partners. Detailed consumption reporting for your cost control.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ConciergeSection() {
    return (
        <section id="contact" className="relative z-30 py-32 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto overflow-hidden shadow-2xl bg-zinc-950 text-white">
                    <div className="grid lg:grid-cols-2">
                        {/* Left: Concierge Info */}
                        <div className="p-12 lg:p-20 relative overflow-hidden flex flex-col justify-between min-h-[600px]">
                            {/* Subtle noise and gradient */}
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

                            <div className="relative z-10">
                                <span className="text-emerald-500 text-xs font-bold tracking-[0.4em] uppercase mb-8 block">Application</span>
                                <h3 className="font-serif text-5xl md:text-6xl text-white mb-8">Access Request</h3>
                                <p className="text-zinc-400 font-light leading-relaxed mb-12 text-lg max-w-sm">
                                    We accept a limited number of new partners each quarter to maintain service integrity.
                                </p>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="border-l border-emerald-500/30 pl-6">
                                    <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-2">Private Line</div>
                                    <a href="tel:+94771234567" className="text-2xl font-serif text-white hover:text-emerald-400 transition-colors tracking-wide">+94 77 123 4567</a>
                                </div>
                                <div className="border-l border-emerald-500/30 pl-6">
                                    <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-2">Direct Email</div>
                                    <a href="mailto:b2b@freshpick.lk" className="text-xl text-white hover:text-emerald-400 transition-colors tracking-wide">b2b@freshpick.lk</a>
                                </div>
                            </div>
                        </div>

                        {/* Right: The Form */}
                        <div className="p-12 lg:p-20 bg-zinc-900 border-l border-zinc-800">
                            <form className="space-y-8" action="mailto:b2b@freshpick.lk" method="post" encType="text/plain">
                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 block">Establishment Name</label>
                                        <div className="relative">
                                            <input type="text" className="w-full bg-transparent border-b border-zinc-700 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 font-serif text-xl" placeholder="e.g. The Grand Hotel" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 block">Contact Person</label>
                                            <input type="text" className="w-full bg-transparent border-b border-zinc-700 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 text-sm" placeholder="Full Name" />
                                        </div>
                                        <div className="group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 block">Direct Phone</label>
                                            <input type="tel" className="w-full bg-transparent border-b border-zinc-700 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 text-sm" placeholder="+94..." />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 block">Weekly Volume Est.</label>
                                        <textarea rows={3} className="w-full bg-transparent border-b border-zinc-700 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700 resize-none text-sm" placeholder="Briefly describe your requirements..."></textarea>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full bg-white hover:bg-emerald-50 text-zinc-950 font-bold h-16 rounded-none mt-4 transition-all uppercase tracking-widest text-xs">
                                    Request Review
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
