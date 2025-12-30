import { Metadata } from 'next';
import dbConnect from '@/lib/database';
import SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import SubscriptionHero from '@/components/subscriptions/SubscriptionHero';
import SubscriptionPlanCard from '@/components/subscriptions/SubscriptionPlanCard';
import { Check, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Subscription Boxes | Fresh Pick',
    description: 'Subscribe to curated boxes of fresh produce delivered weekly. Save time and money with our subscription service.',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getSubscriptionPlans() {
    try {
        await dbConnect();
        const plans = await SubscriptionPlan.find({ isActive: true })
            .sort({ price: 1 })
            .lean();
        return JSON.parse(JSON.stringify(plans));
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
    }
}

// Default plans if database is empty
const defaultPlans = [
    {
        _id: '1',
        name: 'Fresh Start',
        slug: 'fresh-start',
        description: 'Perfect for health-conscious individuals who want fresh fruits and vegetables weekly.',
        shortDescription: 'Seasonal fruits & veggies',
        price: 1800,
        originalPrice: 2200,
        frequency: 'weekly',
        icon: '🥗',
        color: 'emerald',
        features: [
            '5-7 seasonal vegetables',
            '3-4 fresh fruits',
            'Recipe suggestions included',
            'Sourced from local farms',
            'Free delivery',
        ],
        contents: [
            { name: 'Tomatoes', quantity: '500g', category: 'Vegetables' },
            { name: 'Carrots', quantity: '250g', category: 'Vegetables' },
            { name: 'Bananas', quantity: '6 pcs', category: 'Fruits' },
            { name: 'Apples', quantity: '4 pcs', category: 'Fruits' },
            { name: 'Spinach', quantity: '200g', category: 'Leafy Greens' },
        ],
        isFeatured: false,
    },
    {
        _id: '2',
        name: 'Kitchen Essentials',
        slug: 'kitchen-essentials',
        description: 'All the basics you need for a fully stocked kitchen, delivered to your door.',
        shortDescription: 'Eggs, milk, bread & basics',
        price: 3500,
        originalPrice: 4200,
        frequency: 'weekly',
        icon: '🍳',
        color: 'blue',
        features: [
            'Fresh eggs (30 pcs)',
            'Fresh milk (2L)',
            'Artisan bread',
            'Butter & cheese',
            'Weekly basics bundle',
            'Free delivery',
        ],
        contents: [
            { name: 'Farm Eggs', quantity: '30 pcs', category: 'Dairy' },
            { name: 'Fresh Milk', quantity: '2L', category: 'Dairy' },
            { name: 'Bread', quantity: '2 loaves', category: 'Bakery' },
            { name: 'Butter', quantity: '250g', category: 'Dairy' },
        ],
        isFeatured: true,
    },
    {
        _id: '3',
        name: 'Organic Life',
        slug: 'organic-life',
        description: 'Premium certified organic produce for the health-conscious family.',
        shortDescription: 'Certified organic produce',
        price: 4500,
        originalPrice: 5500,
        frequency: 'weekly',
        icon: '🌿',
        color: 'purple',
        features: [
            '100% certified organic',
            'Chemical-free produce',
            'Premium quality selection',
            'Eco-friendly packaging',
            'Carbon-neutral delivery',
            'Priority support',
        ],
        contents: [
            { name: 'Organic Veggies', quantity: 'Assorted', category: 'Organic' },
            { name: 'Organic Fruits', quantity: 'Assorted', category: 'Organic' },
            { name: 'Organic Eggs', quantity: '12 pcs', category: 'Organic' },
        ],
        isFeatured: false,
    },
    {
        _id: '4',
        name: 'Family Bundle',
        slug: 'family-bundle',
        description: 'Complete weekly groceries for a family of 4. Everything you need, one box.',
        shortDescription: 'Complete weekly groceries',
        price: 6000,
        originalPrice: 7500,
        frequency: 'weekly',
        icon: '🍲',
        color: 'orange',
        features: [
            'Feeds family of 4',
            'Fresh produce + essentials',
            'Meal planning guide',
            'Customizable contents',
            'Weekend recipe ideas',
            'Priority morning delivery',
        ],
        contents: [
            { name: 'Weekly Vegetables', quantity: 'Full set', category: 'Vegetables' },
            { name: 'Weekly Fruits', quantity: 'Full set', category: 'Fruits' },
            { name: 'Dairy Pack', quantity: 'Complete', category: 'Dairy' },
            { name: 'Rice', quantity: '5kg', category: 'Staples' },
            { name: 'Cooking Essentials', quantity: 'Assorted', category: 'Pantry' },
        ],
        isFeatured: false,
    },
];

export default async function SubscriptionsPage() {
    let plans = await getSubscriptionPlans();

    // Use default plans if no plans in database
    if (!plans || plans.length === 0) {
        plans = defaultPlans;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <SubscriptionHero />

            {/* Subscription Plans */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Choose Your Perfect Box
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Select the subscription that fits your lifestyle. All boxes include free delivery and can be paused or cancelled anytime.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {plans.map((plan: any) => (
                            <SubscriptionPlanCard key={plan._id} plan={plan} />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-emerald-600">1</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Choose Your Box</h3>
                            <p className="text-gray-600 text-sm">Select the subscription plan that best fits your needs and budget.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-emerald-600">2</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Set Delivery Day</h3>
                            <p className="text-gray-600 text-sm">Choose your preferred delivery day and time slot for weekly deliveries.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-emerald-600">3</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Enjoy Fresh Groceries</h3>
                            <p className="text-gray-600 text-sm">Receive your curated box of fresh groceries every week at your doorstep.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            {
                                q: 'Can I pause or cancel my subscription?',
                                a: 'Yes! You can pause or cancel your subscription anytime from your profile. No questions asked.',
                            },
                            {
                                q: 'What if I\'m not satisfied with my delivery?',
                                a: 'We offer a 100% satisfaction guarantee. If you\'re not happy with any item, we\'ll replace it or refund you.',
                            },
                            {
                                q: 'Can I customize what\'s in my box?',
                                a: 'You can specify items you want to exclude (e.g., allergies). Full customization coming soon!',
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept Cash on Delivery (COD), bank transfers, and card payments.',
                            },
                        ].map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                                        <p className="text-gray-600 text-sm">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                        Join hundreds of happy subscribers enjoying fresh groceries delivered to their door every week.
                    </p>
                    <Link
                        href="#plans"
                        className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors"
                    >
                        View Plans
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
