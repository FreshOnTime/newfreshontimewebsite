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
        <section ref={ref} className="relative h-[90vh] flex items-center justify-center overflow-hidden z-10">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <motion.div style={{ y, opacity }} className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                        alt="Fresh Premium Produce"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Dark overlay for text readability, but lighter than before for 'fresh' feel */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white/10" />
                </motion.div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center items-center text-center">
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                    >
                        <span className="inline-flex items-center gap-2 border border-white/30 px-6 py-2 rounded-full backdrop-blur-md bg-white/10 text-white text-xs md:text-sm tracking-widest uppercase font-bold">
                            Private Client Division
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tighter text-white leading-[0.9]"
                    >
                        FINEST
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-xl md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
                    >
                        The definitive supply chain for Colombo's highest-grossing kitchens.
                    </motion.p>
                </div>
            </div>

            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-white/70"
            >
                <ArrowDown className="w-6 h-6" />
            </motion.div>
        </section>
    );
}

function PhilosophySection() {
    return (
        <section className="relative z-20 py-24 md:py-32 container mx-auto px-4 bg-white">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                {/* Text Content */}
                <div className="lg:w-1/2 flex flex-col justify-center">
                    <span className="text-emerald-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">The Philosophy</span>
                    <h2 className="font-serif text-5xl md:text-6xl text-zinc-900 mb-8 leading-[1.1]">
                        Uncompromising<br />
                        <span className="italic text-emerald-700">Precision.</span>
                    </h2>
                    <p className="text-lg text-zinc-600 font-light leading-relaxed max-w-lg mb-8">
                        We don't just deliver vegetables. We curate the foundation of your Michelin-standard menu with military precision and artistic obsession.
                    </p>
                    <div className="grid grid-cols-2 gap-8 border-t border-zinc-100 pt-8">
                        <div>
                            <h4 className="text-3xl font-serif text-zinc-900 mb-2">12h</h4>
                            <p className="text-sm text-zinc-500 uppercase tracking-wider">Harvest to Kitchen</p>
                        </div>
                        <div>
                            <h4 className="text-3xl font-serif text-zinc-900 mb-2">100%</h4>
                            <p className="text-sm text-zinc-500 uppercase tracking-wider">Cold Chain</p>
                        </div>
                    </div>
                </div>

                {/* Image Grid/Collage */}
                <div className="lg:w-1/2 relative h-[600px] w-full">
                    <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gray-100 rounded-lg overflow-hidden shadow-2xl z-10">
                        <Image
                            src="https://images.unsplash.com/photo-1590779033100-9f60d05a1217?q=80&w=2574&auto=format&fit=crop"
                            alt="Sourcing"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gray-100 rounded-lg overflow-hidden shadow-xl z-20 border-8 border-white">
                        <Image
                            src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=2574&auto=format&fit=crop"
                            alt="Curation"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function CollectionGrid() {
    const galleryItems = [
        { name: "Heirloom Tomatoes", origin: "Nuwara Eliya", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2574" },
        { name: "White Asparagus", origin: "Jaffna Organic", img: "https://images.unsplash.com/photo-1515471209610-dae1c92d8777?q=80&w=2670" },
        { name: "Microgreens", origin: "Hydro Lab", img: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2670" },
        { name: "Exotic Mushrooms", origin: "Cloud Forest", img: "https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?q=80&w=2670" }
    ];

    return (
        <section className="relative bg-zinc-50 z-20 py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <span className="text-emerald-600 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Collection</span>
                        <h2 className="font-serif text-4xl md:text-6xl text-zinc-900 leading-none">
                            Rare <span className="italic text-emerald-700">Finds</span>
                        </h2>
                    </div>
                    <Button variant="outline" className="border-zinc-300 text-zinc-900 hover:bg-zinc-900 hover:text-white px-8 py-6 text-lg hidden md:inline-flex rounded-full transition-all">
                        Download Catalog
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {galleryItems.map((item, i) => (
                        <div key={i} className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                <Image
                                    src={item.img}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>
                            <div className="p-6">
                                <span className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-2 block">{item.origin}</span>
                                <h3 className="text-xl font-serif text-zinc-900 group-hover:text-emerald-700 transition-colors">{item.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 md:hidden">
                    <Button variant="outline" className="w-full border-zinc-300 text-zinc-900 hover:bg-zinc-900 hover:text-white py-6 text-lg rounded-full">
                        Download Catalog
                    </Button>
                </div>
            </div>
        </section>
    );
}

function ConciergeSection() {
    return (
        <section id="contact" className="relative z-30 py-24 lg:py-32 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 text-white">
                    <div className="grid lg:grid-cols-2">
                        {/* Left: Concierge Info */}
                        <div className="p-12 lg:p-20 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
                            <div className="absolute inset-0 opacity-20">
                                <Image
                                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574"
                                    alt="Restaurant Interior"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/40 to-transparent" />

                            <div className="relative z-10">
                                <span className="text-emerald-400 text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Membership</span>
                                <h3 className="font-serif text-4xl md:text-5xl text-white mb-6">Concierge</h3>
                                <p className="text-zinc-300 font-light leading-relaxed mb-12 text-lg">
                                    Approved partners receive dedicated 24/7 account management and priority logicstics.
                                </p>
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div>
                                    <div className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-1">Direct Line</div>
                                    <a href="tel:+94771234567" className="text-2xl font-serif text-white hover:text-emerald-400 transition-colors">+94 77 123 4567</a>
                                </div>
                                <div>
                                    <div className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-1">Email</div>
                                    <a href="mailto:b2b@freshpick.lk" className="text-xl text-white hover:text-emerald-400 transition-colors">b2b@freshpick.lk</a>
                                </div>
                            </div>
                        </div>

                        {/* Right: The Form */}
                        <div className="p-12 lg:p-20 bg-emerald-950/50 backdrop-blur-sm">
                            <form className="space-y-6" action="mailto:b2b@freshpick.lk" method="post" encType="text/plain">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">Establishment</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-colors placeholder:text-white/20" placeholder="Restaurant or Hotel Name" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">Contact Person</label>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-colors placeholder:text-white/20" placeholder="Full Name" />
                                        </div>
                                        <div className="group">
                                            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">Direct Phone</label>
                                            <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-colors placeholder:text-white/20" placeholder="+94..." />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">Requirements</label>
                                        <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-colors placeholder:text-white/20 resize-none" placeholder="Est. weekly volume..."></textarea>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold h-14 rounded-full mt-2 transition-all shadow-lg hover:shadow-emerald-500/25">
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
