'use client';

import { Package, Check, Star, Clock, Truck, Sparkles, Salad, Egg, Leaf, Users, ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface SubscriptionPlan {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice?: number;
    frequency: string;
    icon: string;
    image?: string;
    color: string;
    features: string[];
    contents: { name: string; quantity: string; category: string }[];
    isFeatured?: boolean;
}

interface SubscriptionPlanCardProps {
    plan: SubscriptionPlan;
}

// Map icons to Lucide components for professional look
const planIcons: { [key: string]: React.ElementType } = {
    'fresh-start': Salad,
    'kitchen-essentials': Egg,
    'organic-life': Leaf,
    'family-bundle': Users,
};

const colorClasses: { [key: string]: { bg: string; border: string; text: string; button: string; iconBg: string } } = {
    emerald: {
        bg: 'from-emerald-50 to-emerald-100/50',
        border: 'border-emerald-200 hover:border-emerald-400',
        text: 'text-emerald-600',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        iconBg: 'bg-emerald-100',
    },
    blue: {
        bg: 'from-slate-50 to-slate-100/50',
        border: 'border-slate-200 hover:border-emerald-400',
        text: 'text-emerald-600',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        iconBg: 'bg-emerald-100',
    },
    purple: {
        bg: 'from-emerald-50 to-teal-100/50',
        border: 'border-emerald-200 hover:border-teal-400',
        text: 'text-teal-600',
        button: 'bg-teal-600 hover:bg-teal-700',
        iconBg: 'bg-teal-100',
    },
    orange: {
        bg: 'from-emerald-50/80 to-emerald-100/60',
        border: 'border-emerald-300 hover:border-emerald-500',
        text: 'text-emerald-700',
        button: 'bg-emerald-700 hover:bg-emerald-800',
        iconBg: 'bg-emerald-200',
    },
    teal: {
        bg: 'from-teal-50 to-teal-100/50',
        border: 'border-teal-200 hover:border-teal-400',
        text: 'text-teal-600',
        button: 'bg-teal-600 hover:bg-teal-700',
        iconBg: 'bg-teal-100',
    },
};

export default function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
    const colors = colorClasses[plan.color] || colorClasses.emerald;
    const frequencyLabel = plan.frequency === 'weekly' ? '/week' : plan.frequency === 'monthly' ? '/month' : '/2 weeks';
    const IconComponent = planIcons[plan.slug] || ShoppingBasket;

    return (
        <div
            className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl border-2 ${colors.border} p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}
        >
            {/* Featured Badge */}
            {plan.isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                    </span>
                </div>
            )}

            {/* Icon & Name - Professional Icon instead of emoji */}
            <div className="text-center mb-4">
                <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                    <IconComponent className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.shortDescription}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                    {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">Rs. {plan.originalPrice.toLocaleString()}</span>
                    )}
                    <span className={`text-3xl font-bold ${colors.text}`}>Rs. {plan.price.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm">{frequencyLabel}</span>
                </div>
                {plan.originalPrice && (
                    <span className="inline-block mt-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Save Rs. {(plan.originalPrice - plan.price).toLocaleString()}
                    </span>
                )}
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
                {plan.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className={`w-4 h-4 ${colors.text} shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {/* What's Included */}
            {plan.contents && plan.contents.length > 0 && (
                <div className="bg-white/50 rounded-xl p-3 mb-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What's Included</p>
                    <div className="flex flex-wrap gap-1">
                        {plan.contents.slice(0, 4).map((item, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center text-xs bg-white px-2 py-1 rounded-full border border-gray-200"
                            >
                                {item.name}
                            </span>
                        ))}
                        {plan.contents.length > 4 && (
                            <span className="inline-flex items-center text-xs text-gray-500 px-2 py-1">
                                +{plan.contents.length - 4} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* CTA Button */}
            <Link href={`/subscriptions/checkout?plan=${plan.slug}`} className="block">
                <Button className={`w-full ${colors.button} text-white font-semibold py-3 rounded-xl group-hover:shadow-lg transition-all`}>
                    Subscribe Now
                    <Sparkles className="w-4 h-4 ml-2" />
                </Button>
            </Link>

            {/* Delivery Info */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Free Delivery
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Cancel anytime
                </span>
            </div>
        </div>
    );
}
