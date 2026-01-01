import { Metadata } from 'next';
import Link from 'next/link';
import { Leaf, Tractor, MapPin, Shield, Users, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Farm-to-Table | Fresh Pick Direct from Farmers',
    description: 'Traceable, organic produce sourced directly from Sri Lankan farmers. Know exactly where your food comes from. Support local agriculture.',
};

const farmers = [
    { name: 'Gunasena Farm', location: 'Nuwara Eliya', specialty: 'Organic Vegetables', since: '2023' },
    { name: 'Silva Dairy', location: 'Kandy', specialty: 'Fresh Milk & Cheese', since: '2023' },
    { name: 'Green Valley', location: 'Jaffna', specialty: 'Tropical Fruits', since: '2024' },
    { name: 'Ocean Fresh', location: 'Negombo', specialty: 'Sustainable Seafood', since: '2024' },
];

const benefits = [
    {
        icon: Tractor,
        title: 'Direct from Farmers',
        description: 'No middlemen. Fair prices for farmers, fresher produce for you.',
    },
    {
        icon: MapPin,
        title: 'Full Traceability',
        description: 'Scan the QR code to see exactly which farm your produce came from.',
    },
    {
        icon: Shield,
        title: 'Organic Certified',
        description: 'Pesticide-free, sustainable farming practices.',
    },
    {
        icon: Award,
        title: 'Premium Quality',
        description: 'Hand-picked, graded produce delivered within 24 hours of harvest.',
    },
];

export default function FarmToTablePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <Leaf className="w-5 h-5" />
                            <span className="text-sm font-medium">Farm-to-Table</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Know Your Farmer, <br />Trust Your Food
                        </h1>
                        <p className="text-lg md:text-xl text-green-100 mb-8 leading-relaxed">
                            We partner directly with Sri Lankan farmers to bring you the freshest,
                            most traceable produce. Every item tells a story.
                        </p>
                        <Button size="lg" className="bg-white text-green-900 hover:bg-green-50">
                            <Leaf className="w-5 h-5 mr-2" />
                            Shop Farm Fresh
                        </Button>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit) => (
                            <div key={benefit.title} className="text-center p-6">
                                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="w-7 h-7 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-gray-600 text-sm">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Farmers */}
            <section className="py-16 bg-green-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Meet Our Partner Farmers</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {farmers.map((farmer) => (
                            <div key={farmer.name} className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                                <p className="text-sm text-gray-600">{farmer.location}</p>
                                <p className="text-sm text-green-600 font-medium mt-2">{farmer.specialty}</p>
                                <p className="text-xs text-gray-400 mt-1">Partner since {farmer.since}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-24 bg-green-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Taste the Difference</h2>
                    <p className="text-green-100 mb-8 max-w-xl mx-auto">
                        Subscribe to our Farm Box and receive weekly deliveries of seasonal, organic produce.
                    </p>
                    <Link href="/subscriptions">
                        <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                            Subscribe to Farm Box
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
