"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: AnimatedSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface AnimatedProductGridProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedProductGrid({
    children,
    className = "",
}: AnimatedProductGridProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface AnimatedProductItemProps {
    children: ReactNode;
    index: number;
}

export function AnimatedProductItem({
    children,
    index,
}: AnimatedProductItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
        >
            {children}
        </motion.div>
    );
}
