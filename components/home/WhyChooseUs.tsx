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
        <section className="py-20 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                        Why Fresh Pick?
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        The Fresh Pick <span className="text-emerald-600">Difference</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        We&apos;re not just another grocery store. We&apos;re your partner in healthy, sustainable living.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            className="group relative bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-emerald-100/50 hover:border-emerald-200 transition-all duration-500"
                        >
                            {/* Decorative gradient blob */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-emerald-200/50"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "50K+", label: "Happy Customers" },
                            { value: "500+", label: "Fresh Products" },
                            { value: "100%", label: "Satisfaction Rate" },
                            { value: "24h", label: "Fast Delivery" },
                        ].map((stat, index) => (
                            <div key={stat.label}>
                                <motion.p
                                    initial={{ scale: 0.5 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                                    className="text-3xl md:text-5xl font-bold mb-2"
                                >
                                    {stat.value}
                                </motion.p>
                                <p className="text-emerald-100 text-sm md:text-base">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
