import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Truck, Clock, ShieldCheck, Users, ChefHat, Phone, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'B2B Supply | Fresh Pick for Restaurants & Hotels',
    description: 'Premium wholesale grocery supply for restaurants, hotels, and catering businesses in Sri Lanka. Bulk pricing, reliable delivery, and dedicated account management.',
};

const benefits = [
    {
        icon: Truck,
        title: 'Reliable Daily Delivery',
        description: 'Scheduled deliveries 6 days a week. Never run out of fresh produce.',
    },
    {
        icon: Clock,
        title: 'Flexible Ordering',
        description: 'Order until 8 PM for next-day delivery. Emergency orders available.',
    },
    {
        icon: ShieldCheck,
        title: 'Quality Guaranteed',
        description: 'Grade-A produce sourced directly from farms. Freshness guaranteed.',
    },
    {
        icon: Users,
        title: 'Dedicated Account Manager',
        description: 'Personal support for your business. Custom pricing for volume orders.',
    },
];

const categories = [
    { name: 'Fresh Vegetables', items: '50+ varieties' },
    { name: 'Fruits', items: 'Local & imported' },
    { name: 'Dairy & Eggs', items: 'Daily fresh supply' },
    { name: 'Meats & Seafood', items: 'Premium cuts' },
    { name: 'Dry Goods', items: 'Bulk packaging' },
    { name: 'Beverages', items: 'Wholesale rates' },
];

export default function B2BPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-20 md:py-28">
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <Building2 className="w-5 h-5" />
                            <span className="text-sm font-medium">For Restaurants & Hotels</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Wholesale Fresh Produce for Your Business
                        </h1>
                        <p className="text-lg md:text-xl text-emerald-100 mb-8 leading-relaxed">
                            Partner with Fresh Pick for reliable, premium-quality grocery supply.
                            Serving 200+ restaurants and hotels across Colombo.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                                <ChefHat className="w-5 h-5 mr-2" />
                                Request a Quote
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                <Phone className="w-5 h-5 mr-2" />
                                Call: +94 77 123 4567
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Restaurants Choose Us
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Join 200+ food businesses that trust Fresh Pick for their daily supply needs.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit) => (
                            <div key={benefit.title} className="text-center p-6">
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-gray-600 text-sm">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">What We Supply</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <div key={cat.name} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                                <p className="text-sm text-emerald-600">{cat.items}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-24 bg-emerald-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Partner?</h2>
                    <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                        Get custom pricing for your business. Our team will contact you within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                            <Mail className="w-5 h-5 mr-2" />
                            b2b@freshpick.lk
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
