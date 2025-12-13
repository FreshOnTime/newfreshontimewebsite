"use client";

import React from "react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default function RefundPage() {
    return (
        <div className="bg-white min-h-screen">
            <PremiumPageHeader
                title="Refund & Replacement Policy"
                subtitle="We stand behind the freshness of our products."
                backgroundImage="https://images.unsplash.com/photo-1627993079361-bd80b8577030?q=80&w=2670&auto=format&fit=crop"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Intro Alert */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-12 flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-emerald-900 mb-1">Our Freshness Guarantee</h3>
                        <p className="text-emerald-800 text-sm">
                            If any perishable item you receive is not up to standard, we will replace it or refund it—no questions asked, provided you report it within 24 hours.
                        </p>
                    </div>
                </div>

                <div className="prose prose-emerald max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                Perishable Items
                            </h2>
                            <p className="text-gray-600 text-sm mb-4">
                                (Vegetables, Fruits, Meat, Seafood, Dairy)
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                <li>Must be reported within <strong>24 hours</strong> of delivery.</li>
                                <li>Please provide a photo of the item if possible.</li>
                                <li>We will offer a replacement in your next order or a store credit refund.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                Non-Perishable Items
                            </h2>
                            <p className="text-gray-600 text-sm mb-4">
                                (Packaged Foods, Household Items)
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                <li>Returnable within <strong>7 days</strong> of delivery.</li>
                                <li>Item must be unopened and in original packaging.</li>
                                <li>Refunds will be processed to your original payment method or as store credit.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-12 border-t border-gray-100 pt-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
                            <ol className="list-decimal pl-6 space-y-3 text-gray-600">
                                <li>Take a photo of the item (for quality issues).</li>
                                <li>Contact us via WhatsApp or Email at <a href="mailto:hello@freshpick.lk" className="text-primary hover:underline">hello@freshpick.lk</a>.</li>
                                <li>Include your <strong>Order Number</strong> and details of the issue.</li>
                                <li>Our team will respond within 24 hours to resolve it.</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unavailable Items</h2>
                            <p className="text-gray-600">
                                If an item you ordered is out of stock at the time of packing, we will automatically refund that amount to your account or deduct it from your Cash on Delivery total.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Late or Missing Refunds</h2>
                            <p className="text-gray-600">
                                If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, as it may take some time before your refund is officially posted.
                                If you’ve done all of this and you still have not received your refund yet, please contact us.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
