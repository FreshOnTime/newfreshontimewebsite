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
        <section className="py-6 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-y border-emerald-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-emerald-100/50 hover:border-emerald-200 hover:shadow-md transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-colors duration-300">
                                <badge.icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{badge.title}</p>
                                <p className="text-xs text-gray-500">{badge.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
