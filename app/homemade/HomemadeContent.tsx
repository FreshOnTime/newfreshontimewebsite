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
        <div className="relative bg-white text-zinc-900 selection:bg-amber-100 selection:text-amber-900 overflow-clip">
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
        <section ref={ref} className="relative h-[70vh] flex items-center justify-center overflow-hidden z-10 bg-zinc-950">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <motion.div style={{ y, opacity }} className="absolute inset-0">
                    {/* Using a placeholder or existing image that fits the 'homemade' vibe */}
                    <Image
                        src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2670&auto=format&fit=crop"
                        alt="Handcrafted Background"
                        fill
                        className="object-cover opacity-50 grayscale"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950" />
                </motion.div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center items-center text-center">
                <div className="space-y-8 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                    >
                        <span className="inline-flex items-center gap-3 border-y border-amber-500/30 py-2 px-4 text-amber-500 text-xs md:text-sm tracking-[0.3em] uppercase font-bold">
                            Curated Excellence
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="font-serif text-5xl md:text-7xl tracking-tight text-white leading-none"
                    >
                        Homemade & <br />
                        <span className="text-amber-200 italic">Handcrafted.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-lg md:text-xl font-light text-zinc-300 max-w-2xl mx-auto leading-relaxed"
                    >
                        Discover a curated collection of premium domestic produce from small entrepreneurs.
                        Each item is a testament to passion, quality, and the art of creation.
                    </motion.p>
                </div>
            </div>
        </section>
    );
}

function PhilosophySection() {
    return (
        <section className="relative z-20 py-24 container mx-auto px-4 bg-zinc-50 border-b border-zinc-200">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center md:text-left">
                    <span className="text-emerald-900 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">The Craftsmen</span>
                    <h2 className="font-serif text-3xl md:text-5xl text-zinc-900 leading-[1.2] max-w-4xl">
                        Supporting the finest local artisans and their dedication to traditional methods.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold tracking-wide uppercase text-zinc-900 border-t border-amber-900/10 pt-4">Authentic Origins</h3>
                        <p className="text-zinc-600 font-light leading-relaxed">
                            Sourced directly from home kitchens and small farms that prioritize flavor over mass production.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold tracking-wide uppercase text-zinc-900 border-t border-amber-900/10 pt-4">Small Batch</h3>
                        <p className="text-zinc-600 font-light leading-relaxed">
                            Limited quantities ensure meticulous attention to detail and superior quality control in every item.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold tracking-wide uppercase text-zinc-900 border-t border-amber-900/10 pt-4">Community Growth</h3>
                        <p className="text-zinc-600 font-light leading-relaxed">
                            Empowering local entrepreneurs by connecting their exceptional products with discerning customers.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProductDisplaySection({ products }: { products: Product[] }) {
    return (
        <section className="relative bg-white z-20 py-24 min-h-[50vh]">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-serif text-emerald-950">
                        Current Selections
                    </h2>
                    <span className="text-sm text-zinc-500 font-medium tracking-widest uppercase">
                        {products.length} {products.length === 1 ? 'Item' : 'Items'} Found
                    </span>
                </div>

                <ProductGrid products={products} />

                {products.length === 0 && (
                    <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        <p className="text-xl text-zinc-400 font-serif mb-2">Curating Excellence...</p>
                        <p className="text-zinc-500">We are currently selecting the finest homemade products for you.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
