"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PremiumPageHeaderProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    count?: number;
}

export default function PremiumPageHeader({
    title,
    subtitle,
    backgroundImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop",
    count
}: PremiumPageHeaderProps) {
    return (
        <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
            {/* Background Image with blur and overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={backgroundImage}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg md:text-xl text-zinc-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                            {subtitle}
                        </p>
                    )}
                    {count !== undefined && (
                        <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-sm backdrop-blur-md">
                            {count} items available
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
