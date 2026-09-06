import type { Metadata } from "next";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { SUPPORT_EMAIL } from "@/lib/config/site";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms that apply when using Fresh Pick accounts, ordering, delivery, and related services.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <PremiumPageHeader
                title="Terms of Service"
                subtitle="Terms that apply when using Fresh Pick accounts, ordering, delivery, and related services."
                eyebrow="Legal · Terms"
            />

            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="prose prose-emerald max-w-none">
                    <p className="mb-8 font-medium text-gray-500">Effective Date: December 2025</p>

                    <p className="mb-8 text-lg leading-relaxed text-gray-600">
                        Welcome to <strong>Fresh Pick</strong>. By accessing or using our website and services, you agree to these Terms and Conditions.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">1. Account Registration</h2>
                            <p className="text-gray-600">
                                To access certain features, you may be required to register for an account. You agree to provide accurate, current, and complete information and to keep that information updated.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">2. Orders and Pricing</h2>
                            <ul className="list-disc space-y-2 pl-6 text-gray-600">
                                <li><strong>Availability:</strong> Orders are subject to product availability.</li>
                                <li><strong>Pricing:</strong> Product prices may change. The applicable price is the price presented when the order is confirmed.</li>
                                <li><strong>Order limits:</strong> Fresh Pick may limit or cancel quantities where necessary for availability, fraud prevention, operational constraints, or service integrity.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">3. Delivery</h2>
                            <p className="text-gray-600">
                                Delivery availability depends on the service area and order. Any delivery timing shown or communicated is an estimate unless Fresh Pick explicitly confirms otherwise.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">4. User Conduct</h2>
                            <p className="text-gray-600">
                                You agree not to use Fresh Pick for unlawful activity or in a way that could damage, interfere with, or misuse the website, services, other users, or Fresh Pick operations.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">5. Governing Law</h2>
                            <p className="text-gray-600">
                                These terms and conditions are governed by and construed in accordance with the laws of Sri Lanka.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">6. Contact Information</h2>
                            <p className="text-gray-600">
                                Questions about these terms can be sent to <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">{SUPPORT_EMAIL}</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
