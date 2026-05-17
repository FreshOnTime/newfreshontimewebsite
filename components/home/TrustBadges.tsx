"use client";

import { motion } from "framer-motion";
import { Shield, Truck, Leaf, Award, Clock, CreditCard } from "lucide-react";

const badges = [
    {
        icon: Shield,
        title: "100% Secure",
        description: "Safe payments",
    },
    {
        icon: Truck,
        title: "Free Delivery",
        description: "Orders over Rs. 10000",
    },
    {
        icon: Leaf,
        title: "Farm Fresh",
        description: "Direct from farms",
    },
    {
        icon: Award,
        title: "Premium Quality",
        description: "Handpicked items",
    },
    {
        icon: Clock,
        title: "Same-Day Delivery",
        description: "Order before 2PM",
    },
    {
        icon: CreditCard,
        title: "Easy Returns",
        description: "Hassle-free refunds",
    },
];

export default function TrustBadges() {
    return (
        <section className="py-12 bg-white border-b border-zinc-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex items-center gap-4 p-4 rounded-none transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 border border-zinc-200 rounded-full group-hover:border-emerald-900 group-hover:bg-emerald-900 transition-all duration-500">
                                <badge.icon className="w-5 h-5 text-zinc-900 group-hover:text-emerald-50 transition-colors duration-500 stroke-1" />
                            </div>
                            <div>
                                <p className="font-serif font-medium text-zinc-900 text-base tracking-wide">{badge.title}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{badge.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
