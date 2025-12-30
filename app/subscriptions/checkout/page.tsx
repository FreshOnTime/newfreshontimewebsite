'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, MapPin, Clock, CreditCard, ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SubscriptionPlan {
    _id: string;
    name: string;
    slug: string;
    price: number;
    frequency: string;
    icon: string;
    features: string[];
}

const defaultPlans: { [key: string]: SubscriptionPlan } = {
    'fresh-start': {
        _id: '1',
        name: 'Fresh Start',
        slug: 'fresh-start',
        price: 1800,
        frequency: 'weekly',
        icon: '🥗',
        features: ['Seasonal fruits & veggies', 'Free delivery', 'Cancel anytime'],
    },
    'kitchen-essentials': {
        _id: '2',
        name: 'Kitchen Essentials',
        slug: 'kitchen-essentials',
        price: 3500,
        frequency: 'weekly',
        icon: '🍳',
        features: ['Eggs, milk, bread & basics', 'Free delivery', 'Cancel anytime'],
    },
    'organic-life': {
        _id: '3',
        name: 'Organic Life',
        slug: 'organic-life',
        price: 4500,
        frequency: 'weekly',
        icon: '🌿',
        features: ['Certified organic produce', 'Free delivery', 'Cancel anytime'],
    },
    'family-bundle': {
        _id: '4',
        name: 'Family Bundle',
        slug: 'family-bundle',
        price: 6000,
        frequency: 'weekly',
        icon: '🍲',
        features: ['Complete weekly groceries', 'Free delivery', 'Cancel anytime'],
    },
};

const deliveryDays = [
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
];

const timeSlots = [
    { value: '9am-12pm', label: '9:00 AM - 12:00 PM' },
    { value: '2pm-5pm', label: '2:00 PM - 5:00 PM' },
];

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planSlug = searchParams.get('plan') || 'fresh-start';

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: 'Colombo',
        postalCode: '',
        instructions: '',
        deliveryDay: 'saturday',
        timeSlot: '9am-12pm',
        paymentMethod: 'cod',
    });

    useEffect(() => {
        // Use default plan
        setPlan(defaultPlans[planSlug] || defaultPlans['fresh-start']);
    }, [planSlug]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!plan) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan._id,
                    deliveryAddress: {
                        fullName: formData.fullName,
                        phone: formData.phone,
                        addressLine1: formData.addressLine1,
                        addressLine2: formData.addressLine2,
                        city: formData.city,
                        postalCode: formData.postalCode,
                        instructions: formData.instructions,
                    },
                    deliverySlot: {
                        day: formData.deliveryDay,
                        timeSlot: formData.timeSlot,
                    },
                    paymentMethod: formData.paymentMethod,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Subscription created successfully!');
                router.push('/profile/subscriptions');
            } else {
                toast.error(data.message || 'Failed to create subscription');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!plan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/subscriptions" className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Subscribe to {plan.name}</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Step 1: Delivery Address */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-semibold">Delivery Address</h2>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <Input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="07X XXX XXXX"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                                    <Input
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="Street address, apartment, etc."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                                    <Input
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleInputChange}
                                        placeholder="Landmark, building name (optional)"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <Input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                        <Input
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            placeholder="Postal code"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Delivery Schedule */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-semibold">Delivery Schedule</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Day *</label>
                                    <select
                                        name="deliveryDay"
                                        value={formData.deliveryDay}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        {deliveryDays.map((day) => (
                                            <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                                    <select
                                        name="timeSlot"
                                        value={formData.timeSlot}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        {timeSlots.map((slot) => (
                                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Payment Method */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-semibold">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your box arrives' },
                                    { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Transfer to our bank account' },
                                ].map((method) => (
                                    <label
                                        key={method.value}
                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === method.value
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.value}
                                            checked={formData.paymentMethod === method.value}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-emerald-600"
                                        />
                                        <div>
                                            <p className="font-medium">{method.label}</p>
                                            <p className="text-sm text-gray-500">{method.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                                <span className="text-3xl">{plan.icon}</span>
                                <div>
                                    <p className="font-semibold">{plan.name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{plan.frequency}</p>
                                </div>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Weekly Price</span>
                                    <span className="font-semibold">Rs. {plan.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Delivery</span>
                                    <span className="font-semibold text-emerald-600">FREE</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.fullName || !formData.phone || !formData.addressLine1}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                {isLoading ? 'Processing...' : 'Start Subscription'}
                            </Button>

                            <p className="text-xs text-gray-500 text-center mt-3">
                                First delivery on the next {formData.deliveryDay.charAt(0).toUpperCase() + formData.deliveryDay.slice(1)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SubscriptionCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
