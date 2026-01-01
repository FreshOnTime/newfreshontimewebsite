"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/home/AnimatedSection";

// --- Data ---
// We can keep specific data arrays if needed, or inline them.
// In the previous attempt, I inlined them in the JSX for the "Philosophy" and "Gallery" sections,
// but let's be consistent. The "stats" and "offerings" from the original request are good to keep.

export default function B2BPage() {
    const containerRef = useRef(null);

    // Global Parallax Scroll Helper
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    return (
        <div ref={containerRef} className="relative bg-[#047857] text-white selection:bg-[#d4af37] selection:text-[#047857] overflow-clip">

            {/* 1. Global Noise Texture (Subtler for Light Mode) */}
            <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.05] mix-blend-overlay">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>

            {/* 2. Hero Section - Cinematic Parallax */}
            <HeroSection />

            {/* 3. Sticky Manifesto - "The Standard" */}
            <PhilosophySection />

            {/* 4. Horizontal Gallery - "The Collection" */}
            <HorizontalGallery />

            {/* 5. Minimalist Concierge Contact */}
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

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={ref} className="relative h-[120vh] flex items-center justify-center overflow-hidden z-10">
            {/* Background (Lighter, Fresher) */}
            <div className="absolute inset-0 z-0">
                <motion.div style={{ y }} className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1615485925694-a031e241692e?q=80&w=2574&auto=format&fit=crop"
                        alt="Fresh Premium Produce"
                        fill
                        className="object-cover opacity-80"
                        priority
                    />
                    {/* White/Emerald Wash for Light Theme */}
                    <div className="absolute inset-0 bg-[#047857]/60 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#047857]/80 via-transparent to-[#047857]" />
                </motion.div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10 h-screen flex flex-col justify-center items-center text-center">
                <motion.div style={{ y: textY }} className="space-y-6 md:space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 border border-[#d4af37]/50 px-6 py-2 rounded-full backdrop-blur-md bg-[#065f46]/40 shadow-sm"
                    >


                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: "circOut" }}
                        className="font-serif text-[15vw] leading-[0.8] tracking-in-tighter text-white mix-blend-overlay opacity-90"
                    >
                        FINEST
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-xl md:text-3xl font-light text-emerald-100/90 max-w-2xl mx-auto leading-relaxed"
                    >
                        The definitive supply chain for Colombo's<br /> highest-grossing kitchens.
                    </motion.p>
                </motion.div>
            </div>

            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-white/50"
            >
                <ArrowDown className="w-6 h-6" />
            </motion.div>
        </section>
    );
}

function PhilosophySection() {
    // This section uses sticky positioning to keep the left side fixed while the right side scrolls.
    return (
        <section className="relative z-20 py-32 container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-20">
                {/* Sticky Left: The Manifesto */}
                <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 flex flex-col justify-center">
                    <span className="text-[#d4af37] text-xs font-bold tracking-[0.4em] uppercase mb-8 block">The Philosophy</span>
                    <h2 className="font-serif text-6xl md:text-8xl text-white mb-10 leading-[0.9]">
                        Uncompromising<br />
                        <span className="text-emerald-300 italic block mt-2">Precision.</span>
                    </h2>
                    <p className="text-xl text-emerald-100/80 font-light leading-relaxed max-w-md border-l border-[#d4af37] pl-8">
                        We don't just deliver vegetables. We curate the foundation of your Michelin-standard menu with military precision and artistic obsession.
                    </p>
                </div>

                {/* Scrollable Right: The Evidence */}
                <div className="lg:w-1/2 space-y-[20vh] pt-[10vh] pb-[10vh]">
                    {[
                        { title: "Sourcing", desc: "Direct relationships with the island's most exclusive growers.", img: "https://images.unsplash.com/photo-1590779033100-9f60d05a1217?q=80&w=2574&auto=format&fit=crop" },
                        { title: "Curation", desc: "Hand-selection of every single unit by our master agronomists.", img: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=2574&auto=format&fit=crop" },
                        { title: "Logistics", desc: "Climate-controlled fleet ensuring farm-fresh crispness upon arrival.", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2670&auto=format&fit=crop" }
                    ].map((item, i) => (
                        <AnimatedSection
                            key={i}
                            className="group"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden mb-8 bg-[#065f46] shadow-xl border border-white/5">
                                <Image
                                    src={item.img}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#047857]/80 to-transparent" />
                            </div>
                            <h3 className="font-serif text-4xl text-white mb-3">{item.title}</h3>
                            <p className="text-emerald-100/60 font-light">{item.desc}</p>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}

function HorizontalGallery() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: targetRef });

    // Map vertical scroll to horizontal scroll
    // NOTE: This usually requires a very tall container to scroll through.
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-[#047857] z-20">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-20 px-20">
                    <div className="flex-shrink-0 w-[40vw] flex flex-col justify-center">
                        <span className="text-[#d4af37] text-xs font-bold tracking-[0.4em] uppercase mb-8 block">The Collection</span>
                        <h2 className="font-serif text-7xl md:text-9xl text-white leading-none">
                            Rare<br /><span className="italic text-emerald-300">Finds</span>
                        </h2>
                    </div>

                    {[
                        { name: "Heirloom Tomatoes", origin: "Nuwara Eliya", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2574" },
                        { name: "White Asparagus", origin: "Jaffna Organic", img: "https://images.unsplash.com/photo-1515471209610-dae1c92d8777?q=80&w=2670" },
                        { name: "Microgreens", origin: "Hydro Lab", img: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2670" },
                        { name: "Exotic Mushrooms", origin: "Cloud Forest", img: "https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?q=80&w=2670" }
                    ].map((item, i) => (
                        <div key={i} className="flex-shrink-0 w-[30vw] h-[60vh] relative group bg-[#065f46] shadow-2xl overflow-hidden border border-white/5">
                            <Image
                                src={item.img}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#047857] via-transparent to-transparent opacity-90" />
                            <div className="absolute bottom-0 left-0 p-8">
                                <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-2 block">{item.origin}</span>
                                <h3 className="text-3xl font-serif text-white">{item.name}</h3>
                            </div>
                        </div>
                    ))}

                    <div className="flex-shrink-0 w-[30vw] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-white text-xl mb-6 font-serif italic">And 150+ more varieties.</p>
                            <Button variant="outline" className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#047857]">
                                Download Catalog
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function ConciergeSection() {
    return (
        <section id="contact" className="relative z-30 py-40 border-t border-white/10 bg-[#047857]">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#d4af37] text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Membership</span>
                        <h2 className="font-serif text-5xl md:text-7xl text-white leading-tight">
                            Strictly by application.<br />
                            <span className="text-emerald-300 italic">Limited availability for {new Date().getFullYear()}.</span>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-0 border border-white/10 shadow-2xl bg-[#065f46]">
                        {/* Left: Concierge Info */}
                        <div className="p-12 lg:p-20 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between bg-[#059669]/20 relative overflow-hidden">
                            <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                            <div className="relative z-10">
                                <h3 className="font-serif text-4xl text-white mb-6">Concierge</h3>
                                <p className="text-emerald-100/70 font-light leading-relaxed mb-12 text-lg">
                                    Approved partners receive dedicated 24/7 account management and priority logicstics.
                                </p>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div>
                                    <div className="text-xs text-[#d4af37] uppercase tracking-widest font-bold mb-2">Direct Line</div>
                                    <a href="tel:+94771234567" className="text-2xl font-serif text-white hover:text-[#d4af37] transition-colors">+94 77 123 4567</a>
                                </div>
                                <div>
                                    <div className="text-xs text-[#d4af37] uppercase tracking-widest font-bold mb-2">Email</div>
                                    <a href="mailto:b2b@freshpick.lk" className="text-xl text-white hover:text-[#d4af37] transition-colors">b2b@freshpick.lk</a>
                                </div>
                            </div>
                        </div>

                        {/* Right: The Form */}
                        <div className="p-12 lg:p-20 bg-[#065f46]">
                            <form className="space-y-8" action="mailto:b2b@freshpick.lk" method="post" encType="text/plain">
                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3 block group-focus-within:text-emerald-300 transition-colors">Establishment</label>
                                        <input type="text" className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-white/20 font-serif text-lg" placeholder="Restaurant or Hotel Name" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="group">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3 block group-focus-within:text-emerald-300 transition-colors">Contact Person</label>
                                            <input type="text" className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-white/20 font-serif text-lg" placeholder="Full Name" />
                                        </div>
                                        <div className="group">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3 block group-focus-within:text-emerald-300 transition-colors">Direct Phone</label>
                                            <input type="tel" className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-white/20 font-serif text-lg" placeholder="+94..." />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3 block group-focus-within:text-emerald-300 transition-colors">Requirements</label>
                                        <textarea rows={2} className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-white/20 font-serif text-lg resize-none" placeholder="Est. weekly volume..."></textarea>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full bg-white text-[#047857] hover:bg-[#d4af37] hover:text-[#047857] h-16 text-lg font-bold tracking-widest uppercase transition-all mt-8 rounded-none border border-transparent hover:border-white/20">
                                    Submit Application
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
