"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Category {
    name: string;
    slug: string;
    imageUrl?: string;
    description?: string;
}

interface CategoryBentoProps {
    categories: Category[];
}

export default function CategoryBento({ categories }: CategoryBentoProps) {
    // Take top 5 for the bento grid
    const featured = categories.slice(0, 5);

    return (
        <section className="py-32 bg-white container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
                <div className="max-w-2xl">
                    <span className="text-emerald-900 font-bold tracking-[0.2em] text-xs uppercase mb-6 block">
                        The Collection
                    </span>
                    <h2 className="text-5xl md:text-7xl font-serif font-medium text-zinc-900 mb-6 leading-[0.9]">
                        Curated Harvests
                    </h2>
                    <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-lg">
                        Hand-selected categories representing the pinnacle of freshness and quality.
                    </p>
                </div>
                <Link
                    href="/categories"
                    className="group flex items-center gap-2 text-zinc-900 border-b border-black pb-1 hover:text-emerald-800 hover:border-emerald-800 transition-all font-bold tracking-widest text-xs uppercase"
                >
                    View All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[900px] md:h-[700px]">
                {featured.map((category, index) => {
                    let gridClass = "";
                    if (index === 0) gridClass = "md:col-span-2 md:row-span-2";
                    else if (index === 1) gridClass = "md:col-span-1 md:row-span-2";
                    else gridClass = "md:col-span-1 md:row-span-1";

                    return (
                        <motion.div
                            key={category.slug}
                            className={`relative group overflow-hidden ${gridClass} cursor-pointer bg-zinc-100`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                        >
                            <Link href={`/categories/${category.slug}`} className="block h-full w-full">
                                <div className="absolute inset-0 bg-zinc-200">
                                    <Image
                                        src={category.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                    />
                                </div>

                                {/* Cinematic Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-white/70 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                        Collection
                                    </span>
                                    <h3 className={`font-serif font-light text-white mb-2 leading-none ${index === 0 ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>
                                        {category.name}
                                    </h3>
                                    <p className="text-zinc-300 font-light text-sm line-clamp-2 max-w-[90%] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
                                        {category.description || `Discover our premium selection of ${category.name}.`}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
