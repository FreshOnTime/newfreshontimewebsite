import type { Metadata } from "next";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { SUPPORT_EMAIL } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Fresh Pick handles personal information used for accounts, orders, delivery, and customer support.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PremiumPageHeader
        title="Privacy Policy"
        subtitle="How Fresh Pick handles information used to run accounts, orders, delivery, and support."
        eyebrow="Legal · Privacy"
      />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-emerald max-w-none">
          <p className="mb-8 font-medium text-gray-500">Effective Date: December 2025</p>

          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            At <strong>Fresh Pick</strong>, we use personal information to provide the website, customer accounts, ordering, delivery, and support.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">1. Information We Collect</h2>
              <p className="mb-4 text-gray-600">When you register or place an order, information may include:</p>
              <ul className="list-disc space-y-2 pl-6 text-gray-600">
                <li><strong>Personal identification:</strong> Name, email address, and phone number.</li>
                <li><strong>Delivery details:</strong> Physical address and delivery instructions.</li>
                <li><strong>Order information:</strong> Products, quantities, recurring-order settings, and order history.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
              <ul className="list-disc space-y-2 pl-6 text-gray-600">
                <li>Process, manage, and deliver orders.</li>
                <li>Communicate about accounts, orders, delivery, or support requests.</li>
                <li>Operate, secure, and improve Fresh Pick services.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">3. Data Security</h2>
              <p className="text-gray-600">
                Fresh Pick uses technical and operational safeguards intended to protect personal information. Access is limited to systems and people that need the information to provide the service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">4. Contact Us</h2>
              <p className="text-gray-600">
                For privacy questions or account-data requests, contact <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">{SUPPORT_EMAIL}</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
