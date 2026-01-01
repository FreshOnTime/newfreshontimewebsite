import { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Globe, Heart, Package, CreditCard, Clock, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Send Groceries to Sri Lanka | Fresh Pick Diaspora',
    description: 'Send fresh groceries to your loved ones in Sri Lanka. Order from abroad, we deliver to their doorstep. Same-day delivery in Colombo.',
};

const steps = [
    {
        icon: Package,
        title: 'Choose a Bundle',
        description: 'Select from curated grocery bundles or build your own custom package.',
    },
    {
        icon: CreditCard,
        title: 'Pay in Your Currency',
        description: 'We accept USD, GBP, EUR, AUD, and CAD. Secure international payments.',
    },
    {
        icon: Send,
        title: 'We Deliver Fresh',
        description: 'Same-day or next-day delivery to any address in Colombo and suburbs.',
    },
];

const bundles = [
    {
        name: 'Essential Care Package',
        price: '$45',
        items: ['Rice 5kg', 'Milk & Dairy', 'Fresh Vegetables', 'Fruits', 'Cooking Oil', 'Spices'],
    },
    {
        name: 'Premium Family Bundle',
        price: '$85',
        items: ['All essentials', 'Premium Meats', 'Seafood', 'Imported Fruits', 'Snacks', 'Beverages'],
    },
    {
        name: 'Monthly Subscription',
        price: '$150/mo',
        items: ['Weekly deliveries', 'Customizable items', 'Priority support', 'Photo confirmation'],
    },
];

export default function DiasporaPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <Globe className="w-5 h-5" />
                            <span className="text-sm font-medium">For Sri Lankans Abroad</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Send Love, <br />One Grocery at a Time
                        </h1>
                        <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed">
                            Living abroad? Send fresh groceries to your parents, family, or friends in Sri Lanka.
                            We handle everything — you just pick, pay, and we deliver.
                        </p>
                        <Button size="lg" className="bg-white text-teal-900 hover:bg-teal-50">
                            <Gift className="w-5 h-5 mr-2" />
                            Send a Package Now
                        </Button>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {steps.map((step, i) => (
                            <div key={step.title} className="text-center">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                    <step.icon className="w-8 h-8 text-teal-600" />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-teal-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                                <p className="text-gray-600 text-sm">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bundles */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Popular Gift Bundles</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {bundles.map((bundle) => (
                            <div key={bundle.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-semibold mb-2">{bundle.name}</h3>
                                <p className="text-3xl font-bold text-teal-600 mb-4">{bundle.price}</p>
                                <ul className="space-y-2 mb-6">
                                    {bundle.items.map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Heart className="w-4 h-4 text-teal-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                                    Select Bundle
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust */}
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        <strong>Trusted by 1,000+ families worldwide.</strong> We send photo confirmations of every delivery
                        so you know your loved ones received their groceries fresh and on time.
                    </p>
                </div>
            </section>
        </div>
    );
}
