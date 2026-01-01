"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PremiumPageHeaderProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string | null;
    backgroundColor?: string;
    count?: number;
    isLoading?: boolean;
}

export default function PremiumPageHeader({
    title,
    subtitle,
    backgroundImage,
    backgroundColor = "bg-zinc-900",
    count,
    isLoading = false
}: PremiumPageHeaderProps) {
    const useGradient = !backgroundImage;

    return (
        <section className={`relative h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-16 ${useGradient ? backgroundColor : ''}`}>
            {/* Background Image with blur and overlay */}
            {!useGradient && (
                <div className="absolute inset-0 z-0">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={backgroundImage!}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                {isLoading ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-24 w-3/4 max-w-lg bg-white/10 rounded-xl mb-6" />
                        <div className="h-8 w-1/2 max-w-md bg-white/5 rounded-lg mb-8" />
                        <div className="h-10 w-32 bg-white/5 rounded-full" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="mb-6 flex justify-center">
                            <span className="h-[1px] w-24 bg-amber-400/60 inline-block" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-heading font-medium text-white mb-6 tracking-wide drop-shadow-2xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-lg md:text-2xl text-zinc-200 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
                                {subtitle}
                            </p>
                        )}
                        {count !== undefined && (
                            <div className="mt-8">
                                <span className="inline-flex items-center px-5 py-2 rounded-full border border-white/10 bg-white/5 text-amber-200/90 text-sm font-medium tracking-widest uppercase backdrop-blur-md">
                                    {count} Items Curated
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </section>
    );
}

