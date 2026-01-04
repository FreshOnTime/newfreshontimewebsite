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
                    className="object-cover opacity-60 scale-105 animate-subtle-zoom"
                    priority
                />
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-zinc-950"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] opacity-80"></div>
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.2] mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-4 rounded-full bg-emerald-950/30 backdrop-blur-md border border-emerald-500/10 text-emerald-400 text-xs font-bold tracking-[0.3em] uppercase mb-8 shadow-2xl">
                        Est. 2024 • Colombo
                    </span>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-medium text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
                        The Art of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-500 italic font-light pr-4">Freshness</span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
                        Curating fresh products and recurring orders for the most discerning tables in Colombo, Sri Lanka.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-zinc-950 hover:bg-emerald-50 px-12 py-8 text-sm font-bold tracking-widest uppercase rounded-none transition-all hover:scale-105"
                        >
                            <Link href="/products">Shop Experience</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="bg-transparent border border-white/20 text-white hover:bg-white/5 px-12 py-8 text-sm font-medium tracking-widest uppercase rounded-none backdrop-blur-sm transition-all"
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
