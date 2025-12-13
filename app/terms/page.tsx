"use client";

import React from "react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen">
            <PremiumPageHeader
                title="Terms of Service"
                subtitle="Please read these terms carefully before using our service."
                backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2670&auto=format&fit=crop"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="prose prose-emerald max-w-none">
                    <p className="font-medium text-gray-500 mb-8">Effective Date: December 2025</p>

                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Welcome to <strong>Fresh Pick</strong>. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Account Registration</h2>
                            <p className="text-gray-600">
                                To access certain features of our service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Orders and Pricing</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600">
                                <li><strong>Availability:</strong> All orders are subject to product availability. We reserve the right to discontinue any product at any time.</li>
                                <li><strong>Pricing:</strong> Prices for our products are subject to change without notice. We commit to charging you the price visible at the time of order confirmation.</li>
                                <li><strong>Right to Refuse:</strong> We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Delivery</h2>
                            <p className="text-gray-600">
                                We currently deliver to Colombo and surrounding suburbs. Delivery times are estimates and commence from the date of shipping, rather than the date of order.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
                            <p className="text-gray-600">
                                You agree not to use the site for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the site in any way that could damage the site, the services, or the general business of Fresh Pick.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Governing Law</h2>
                            <p className="text-gray-600">
                                These terms and conditions are governed by and construed in accordance with the laws of Sri Lanka.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Information</h2>
                            <p className="text-gray-600">
                                Questions about the Terms of Service should be sent to us at <a href="mailto:hello@freshpick.lk" className="text-primary hover:underline font-medium">hello@freshpick.lk</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
