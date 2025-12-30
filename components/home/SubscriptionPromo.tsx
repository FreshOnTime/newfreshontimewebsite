'use client';

import Link from 'next/link';
import { Package, ArrowRight, Star, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionPromo() {
    return (
        <section className="py-12 md:py-16 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium">New! Subscription Boxes</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Fresh Groceries,
                            <span className="block text-amber-400">Delivered Weekly</span>
                        </h2>

                        <p className="text-emerald-100 mb-6 max-w-lg mx-auto lg:mx-0">
                            Subscribe to curated boxes of fresh produce and never worry about grocery shopping again.
                            Starting from just Rs. 1,800/week.
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                            <div className="flex items-center gap-2 text-sm text-emerald-100">
                                <Package className="w-4 h-4 text-amber-400" />
                                <span>Curated Boxes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-emerald-100">
                                <Truck className="w-4 h-4 text-amber-400" />
                                <span>Free Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-emerald-100">
                                <Clock className="w-4 h-4 text-amber-400" />
                                <span>Cancel Anytime</span>
                            </div>
                        </div>

                        <Link href="/subscriptions">
                            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                                View Subscription Plans
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Box Cards Preview */}
                    <div className="flex-1 max-w-md">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: '🥗', name: 'Fresh Start', price: '1,800' },
                                { icon: '🍳', name: 'Kitchen Essentials', price: '3,500' },
                                { icon: '🌿', name: 'Organic Life', price: '4,500' },
                                { icon: '🍲', name: 'Family Bundle', price: '6,000' },
                            ].map((box, index) => (
                                <div
                                    key={index}
                                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
                                >
                                    <span className="text-3xl mb-2 block">{box.icon}</span>
                                    <h3 className="font-semibold text-white text-sm mb-1">{box.name}</h3>
                                    <p className="text-amber-400 text-xs font-medium">Rs. {box.price}/week</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
