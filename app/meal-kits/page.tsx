import { Metadata } from 'next';
import Link from 'next/link';
import { ChefHat, Clock, Leaf, Flame, Users, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Meal Kits | Fresh Pick Recipe Boxes',
    description: 'Pre-portioned recipe boxes with fresh ingredients and easy-to-follow recipes. Cook restaurant-quality meals at home in 30 minutes.',
};

const kits = [
    {
        name: 'Sri Lankan Classics',
        price: 'Rs. 2,500',
        servings: '4 servings',
        time: '35 min',
        recipes: ['Rice & Curry', 'Kottu Roti', 'Fish Ambul Thiyal'],
        color: 'emerald',
    },
    {
        name: 'Healthy & Light',
        price: 'Rs. 2,800',
        servings: '4 servings',
        time: '25 min',
        recipes: ['Buddha Bowl', 'Grilled Fish Salad', 'Veggie Stir-Fry'],
        color: 'teal',
    },
    {
        name: 'Family Feast',
        price: 'Rs. 3,500',
        servings: '6 servings',
        time: '45 min',
        recipes: ['Lamprais', 'Biryani', 'Roast Chicken'],
        color: 'amber',
    },
];

const features = [
    {
        icon: Leaf,
        title: 'Fresh Ingredients',
        description: 'Pre-portioned, farm-fresh ingredients delivered to your door.',
    },
    {
        icon: Clock,
        title: '30-Min Recipes',
        description: 'Easy step-by-step instructions. No culinary skills needed.',
    },
    {
        icon: Flame,
        title: 'Chef-Designed',
        description: 'Recipes crafted by professional chefs for home cooking.',
    },
    {
        icon: ShoppingBag,
        title: 'Zero Waste',
        description: 'Exact portions mean no food waste. Good for you and the planet.',
    },
];

export default function MealKitsPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 text-white py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <ChefHat className="w-5 h-5" />
                            <span className="text-sm font-medium">Meal Kits</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Restaurant Meals, <br />Made at Home
                        </h1>
                        <p className="text-lg md:text-xl text-amber-100 mb-8 leading-relaxed">
                            Pre-portioned ingredients, chef-designed recipes, and everything
                            you need to cook amazing meals in 30 minutes or less.
                        </p>
                        <Button size="lg" className="bg-white text-amber-900 hover:bg-amber-50">
                            <ChefHat className="w-5 h-5 mr-2" />
                            View This Week&apos;s Menu
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="text-center p-6">
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-7 h-7 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Kits */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">This Week&apos;s Kits</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {kits.map((kit) => (
                            <div key={kit.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold">{kit.name}</h3>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-medium">4.8</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mb-2">{kit.price}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {kit.servings}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {kit.time}
                                    </span>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Includes:</p>
                                    <ul className="space-y-1">
                                        {kit.recipes.map((recipe) => (
                                            <li key={recipe} className="text-sm text-gray-600">• {recipe}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700">
                                    Order Kit
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-24 bg-amber-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe & Save 20%</h2>
                    <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                        Get weekly meal kits delivered every Friday. Skip or cancel anytime.
                    </p>
                    <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50">
                        Start Your Subscription
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </section>
        </div>
    );
}
