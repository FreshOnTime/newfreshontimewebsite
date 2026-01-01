"use client";

import { motion } from "framer-motion";
import { Sparkles, Leaf, TrendingUp, Heart } from "lucide-react";
import Image from "next/image";

const features = [
    {
        icon: Sparkles,
        title: "Hand-Selected Quality",
        description: "Every item is carefully inspected and selected by our expert buyers to ensure only the finest products reach your table.",
        gradient: "from-amber-400 to-orange-500",
    },
    {
        icon: Leaf,
        title: "Sustainably Sourced",
        description: "We partner with local farmers who use eco-friendly practices, supporting both the environment and our community.",
        gradient: "from-emerald-400 to-green-600",
    },
    {
        icon: TrendingUp,
        title: "Best Value Guaranteed",
        description: "Competitive pricing without compromising on quality. If you find it cheaper elsewhere, we'll match the price.",
        gradient: "from-blue-400 to-indigo-600",
    },
    {
        icon: Heart,
        title: "Customer-First Approach",
        description: "From seamless ordering to doorstep delivery, we prioritize your satisfaction at every step of the journey.",
        gradient: "from-pink-400 to-rose-600",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-32 bg-zinc-50/50">
            <div className="container mx-auto px-4 md:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <span className="text-amber-600 font-medium tracking-[0.2em] text-xs uppercase mb-6 block">
                        Our Promise
                    </span>
                    <h2 className="text-4xl md:text-6xl font-heading font-medium text-zinc-900 mb-6 drop-shadow-sm">
                        The Fresh Pick <span className="italic font-serif text-emerald-700">Standard</span>
                    </h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-xl font-light leading-relaxed">
                        Redefining the grocery experience with uncompromising quality and white-glove service.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="group relative bg-white rounded-[2rem] p-10 md:p-12 shadow-premium hover:shadow-premium-hover border border-white transition-all duration-500 hover:-translate-y-1"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                <feature.icon className="w-8 h-8 text-white stroke-[1.5]" />
                            </div>

                            <h3 className="text-2xl font-serif text-zinc-900 mb-4 group-hover:text-emerald-800 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-500 leading-relaxed font-light text-lg">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section - Refined */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-24 relative overflow-hidden rounded-[3rem] bg-zinc-900 text-white shadow-2xl py-20 px-8"
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/30 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center max-w-5xl mx-auto">
                        {[
                            { value: "50K+", label: "Happy Customers" },
                            { value: "500+", label: "Premium Products" },
                            { value: "100%", label: "Satisfaction" },
                            { value: "24h", label: "Direct Delivery" },
                        ].map((stat, index) => (
                            <div key={stat.label}>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                                    className="text-4xl md:text-6xl font-heading font-medium mb-3 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent"
                                >
                                    {stat.value}
                                </motion.p>
                                <p className="text-zinc-400 text-sm tracking-widest uppercase font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
