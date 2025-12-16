"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface HomeCarouselProps {
    images: string[];
}

export default function HomeCarousel({ images }: HomeCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchCurrentX = useRef<number | null>(null);

    useEffect(() => {
        if (isPaused) return;
        const t = setInterval(() => {
            setCurrentIndex((i) => (i + 1) % images.length);
        }, 4000);
        return () => clearInterval(t);
    }, [isPaused, images.length]);

    const prevPromo = useCallback(() => {
        setCurrentIndex((i) => (i - 1 + images.length) % images.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 2000);
    }, [images.length]);

    const nextPromo = useCallback(() => {
        setCurrentIndex((i) => (i + 1) % images.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 2000);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prevPromo();
            if (e.key === "ArrowRight") nextPromo();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [prevPromo, nextPromo]);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchCurrentX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchCurrentX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current == null || touchCurrentX.current == null) return;
        const dx = touchCurrentX.current - touchStartX.current;
        const threshold = 50;
        if (dx > threshold) prevPromo();
        else if (dx < -threshold) nextPromo();
        touchStartX.current = null;
        touchCurrentX.current = null;
    };

    return (
        <section className="py-12 md:py-16 bg-gray-50/50">
            <div className="container mx-auto px-4 md:px-8">
                <div
                    className="relative rounded-2xl overflow-hidden shadow-lg"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="w-full h-48 sm:h-64 md:h-[28rem] lg:h-[32rem] relative">
                        {images.map((src, i) => (
                            <div
                                key={src}
                                className={`absolute inset-0 transition-opacity duration-700 ${i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                                    }`}
                            >
                                <Image
                                    src={src}
                                    alt={`Promo ${i + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={i === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 md:px-6">
                        <button
                            onClick={prevPromo}
                            aria-label="Previous"
                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
                        >
                            <ArrowRight className="w-5 h-5 rotate-180 text-gray-700" />
                        </button>
                        <button
                            onClick={nextPromo}
                            aria-label="Next"
                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
                        >
                            <ArrowRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                aria-label={`Show promo ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex
                                        ? "bg-white w-6"
                                        : "bg-white/50 w-2 hover:bg-white/70"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
