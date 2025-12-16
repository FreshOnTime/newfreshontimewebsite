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
    // Take top 5 for the bento grid, others can be in a list or standard grid below if needed
    const featured = categories.slice(0, 5);

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">
                            Curated Collections
                        </h2>
                        <p className="text-zinc-500 text-lg max-w-lg">
                            Explore our hand-picked categories, featuring the season's best harvest.
                        </p>
                    </div>
                    <Link
                        href="/categories"
                        className="hidden md:flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                    >
                        View All Categories <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[800px] md:h-[600px]">
                    {featured.map((category, index) => {
                        // Layout logic:
                        // Index 0: Large (2x2) - Featured
                        // Index 1: Tall (1x2) - Right side
                        // Index 2, 3, 4: Small (1x1) - Bottom row

                        let gridClass = "";
                        if (index === 0) gridClass = "md:col-span-2 md:row-span-2";
                        else if (index === 1) gridClass = "md:col-span-1 md:row-span-2";
                        else gridClass = "md:col-span-1 md:row-span-1";

                        return (
                            <motion.div
                                key={category.slug}
                                className={`relative group rounded-3xl overflow-hidden ${gridClass}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/categories/${category.slug}`} className="block h-full w-full">
                                    <div className="absolute inset-0 bg-zinc-200">
                                        {category.imageUrl ? (
                                            <Image
                                                src={category.imageUrl}
                                                alt={category.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <Image
                                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                                                alt={category.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 grayscale group-hover:grayscale-0"
                                            />
                                        )}
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-50 transition-opacity duration-500" />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                        <span className="text-xs font-bold tracking-widest uppercase mb-2 text-emerald-400 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            Collection
                                        </span>
                                        <h3 className={`font-serif font-bold ${index === 0 ? 'text-4xl' : 'text-2xl'} mb-2`}>
                                            {category.name}
                                        </h3>
                                        <p className="text-zinc-300 text-sm line-clamp-2 opacity-80 group-hover:text-white transition-colors">
                                            {category.description || `Browse our premium ${category.name} selection.`}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
