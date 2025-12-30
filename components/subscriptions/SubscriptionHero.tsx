'use client';

import { Package, Sparkles, Clock, Shield, Leaf } from 'lucide-react';

export default function SubscriptionHero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white py-16 md:py-24">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium">New! Subscription Boxes</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Fresh Groceries,
                        <span className="block bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                            Delivered Weekly
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                        Subscribe to curated boxes of fresh produce, essentials, and organic goodness.
                        Save time, save money, and never run out of groceries again.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Package className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                            <h3 className="font-semibold text-sm">Curated Boxes</h3>
                            <p className="text-xs text-emerald-200 mt-1">Hand-picked fresh items</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                            <h3 className="font-semibold text-sm">Flexible Schedule</h3>
                            <p className="text-xs text-emerald-200 mt-1">Skip or pause anytime</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Shield className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                            <h3 className="font-semibold text-sm">Quality Guaranteed</h3>
                            <p className="text-xs text-emerald-200 mt-1">100% satisfaction</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Leaf className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                            <h3 className="font-semibold text-sm">Farm Fresh</h3>
                            <p className="text-xs text-emerald-200 mt-1">Direct from local farms</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave Bottom */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path
                        d="M0 50L48 45.8C96 41.7 192 33.3 288 29.2C384 25 480 25 576 33.3C672 41.7 768 58.3 864 62.5C960 66.7 1056 58.3 1152 50C1248 41.7 1344 33.3 1392 29.2L1440 25V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>
    );
}
