"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bgs/landing-page-bg-1.jpg"
                    alt="Fresh vegetables background"
                    fill
                    className="object-cover opacity-80"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-sm font-medium tracking-widest uppercase mb-6">
                        The Future of Freshness
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold text-white mb-6 tracking-tight leading-[0.9]">
                        Taste the <br />
                        <span className="text-emerald-400 italic">Extraordinary</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Premium artisanal groceries, sourced from the world&apos;s finest
                        growers, delivered to your doorstep within hours.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-7 text-lg font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
                        >
                            <Link href="/products">Shop Experience</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-white/30 text-white hover:bg-white/10 px-10 py-7 text-lg font-medium rounded-full backdrop-blur-sm transition-all"
                        >
                            <Link href="/categories">View Collections</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                <span className="text-xs tracking-widest uppercase">
                    Scroll to Discover
                </span>
            </div>
        </section>
    );
}
