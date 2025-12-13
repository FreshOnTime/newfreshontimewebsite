"use client";

import React from "react";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <PremiumPageHeader
        title="Privacy Policy"
        subtitle="We value your trust and are committed to protecting your privacy."
        backgroundImage="https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-emerald max-w-none">
          <p className="font-medium text-gray-500 mb-8">Effective Date: December 2025</p>

          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            At <strong>Fresh Pick</strong> (freshpick.lk), we value your trust and are committed to protecting your privacy.
            This policy outlines how we collect, use, and safeguard your personal information.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">When you register or place an order, we collect the following details to ensure successful delivery:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Personal Identification:</strong> Name, email address, and phone number.</li>
                <li><strong>Delivery Details:</strong> Physical address and delivery instructions.</li>
                <li><strong>Order History:</strong> Details of the products you purchase to help us tailor our service to you.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use your data solely for the purpose of:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Processing and delivering your orders accurately.</li>
                <li>Communicating with you regarding order updates or delays.</li>
                <li>Improving our website and product selection based on customer preferences.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
              <p className="text-gray-600">
                We implement standard security measures to protect your personal information. We do not sell or share your personal data with third-party advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about your data or would like to request a deletion of your account, please contact us at <a href="mailto:hello@freshpick.lk" className="text-primary hover:underline font-medium">hello@freshpick.lk</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
