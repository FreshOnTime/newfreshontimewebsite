"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductGrid from "@/components/products/ProductGrid";
import { Product } from "@/models/product";

interface HomemadeContentProps {
    products: Product[];
}

export default function HomemadeContent({ products }: HomemadeContentProps) {
    return (
        <div className="relative bg-zinc-900 text-zinc-100 selection:bg-amber-900 selection:text-amber-100 overflow-clip">
            {/* Cinematic Grain Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
                <svg className="h-full w-full">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            {/* Hero Section */}
            <HeroSection />

            {/* Philosophy/Intro Section */}
            <PhilosophySection />

            {/* Products Section */}
            <ProductDisplaySection products={products} />
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
        <section ref={ref} className="relative h-[85vh] flex items-center justify-center overflow-hidden z-10 bg-zinc-950">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <motion.div style={{ y, opacity }} className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2670&auto=format&fit=crop"
                        alt="Handcrafted Background"
                        fill
                        className="object-cover opacity-60 grayscale-[0.8]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/20 to-zinc-950" />
                </motion.div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center items-center text-center">
                <div className="space-y-10 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-block"
                    >
                        <span className="inline-flex items-center gap-3 border-y border-amber-500/30 py-3 px-6 text-amber-500 text-xs md:text-sm tracking-[0.4em] uppercase font-bold">
                            Curated Excellence
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "circOut", delay: 0.2 }}
                        className="font-serif text-6xl md:text-8xl tracking-tight text-white leading-[0.9]"
                    >
                        Homemade & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 italic pr-2">Handcrafted.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-lg md:text-2xl font-light text-zinc-300 max-w-3xl mx-auto leading-relaxed"
                    >
                        A tribute to the artisans. Discover a curated collection of premium domestic produce from small entrepreneurs, where every item tells a story of passion.
                    </motion.p>
                </div>
            </div>
        </section>
    );
}

function PhilosophySection() {
    return (
        <section className="relative z-20 py-24 container mx-auto px-4 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
                    <div className="space-y-4 p-8 bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-500 group">
                        <h3 className="text-lg font-bold tracking-widest uppercase text-white group-hover:text-amber-400 transition-colors">Authentic Origins</h3>
                        <p className="text-zinc-500 font-light leading-relaxed group-hover:text-zinc-400 transition-colors">
                            Sourced directly from home kitchens. No factories. No assembly lines. Just pure, unadulterated craft.
                        </p>
                    </div>
                    <div className="space-y-4 p-8 bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-500 group">
                        <h3 className="text-lg font-bold tracking-widest uppercase text-white group-hover:text-amber-400 transition-colors">Small Batch</h3>
                        <p className="text-zinc-500 font-light leading-relaxed group-hover:text-zinc-400 transition-colors">
                            Limited quantities ensure meticulous attention to detail. When it's gone, it's gone until the next harvest.
                        </p>
                    </div>
                    <div className="space-y-4 p-8 bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-500 group">
                        <h3 className="text-lg font-bold tracking-widest uppercase text-white group-hover:text-amber-400 transition-colors">Community First</h3>
                        <p className="text-zinc-500 font-light leading-relaxed group-hover:text-zinc-400 transition-colors">
                            Every purchase directly supports a local entrepreneur, fueling the domestic economy from the ground up.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProductDisplaySection({ products }: { products: Product[] }) {
    return (
        <section className="relative bg-zinc-950 z-20 py-32 min-h-[50vh]">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-20 border-b border-white/10 pb-8">
                    <div>
                        <span className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase mb-4 block">The Collection</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-white">
                            Limited Releases
                        </h2>
                    </div>
                    <span className="hidden md:block text-sm text-zinc-500 font-medium tracking-widest uppercase pb-2">
                        {products.length} {products.length === 1 ? 'Masterpiece' : 'Masterpieces'} Available
                    </span>
                </div>

                <ProductGrid products={products} />

                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/5 border border-white/5 border-dashed">
                        <div className="w-16 h-16 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="text-2xl">✨</span>
                        </div>
                        <p className="text-2xl text-zinc-300 font-serif mb-3">Curating Excellence...</p>
                        <p className="text-zinc-500 font-light max-w-md text-center">We are currently selecting the finest homemade products for you. Check back soon for our latest drops.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
