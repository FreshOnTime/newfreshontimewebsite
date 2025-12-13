"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from "framer-motion";
import { wrap } from "@motionone/utils";

interface ParallaxTextProps {
    children: string;
    baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxTextProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="parallax overflow-hidden m-0 whitespace-nowrap flex flex-nowrap py-4">
            <motion.div className="scroller font-semibold uppercase text-3xl md:text-5xl flex whitespace-nowrap flex-nowrap gap-8" style={{ x }}>
                <span className="block">{children} </span>
                <span className="block">{children} </span>
                <span className="block">{children} </span>
                <span className="block">{children} </span>
            </motion.div>
        </div>
    );
}

export default function InfiniteMarquee() {
    return (
        <section className="py-8 bg-emerald-900 text-emerald-100 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            <ParallaxText baseVelocity={-2}>ORGANIC • FRESH • SUSTAINABLE • LOCAL • PREMIUM • </ParallaxText>
            <ParallaxText baseVelocity={2}>DELIVERED DAILY • FARM TO TABLE • QUALITY GUARANTEED • </ParallaxText>
        </section>
    );
}
