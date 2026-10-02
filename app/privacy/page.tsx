import { publicPageMetadata } from '@/lib/publicPages';
import type { Metadata } from "next";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { SUPPORT_EMAIL } from "@/lib/config/site";

export const metadata: Metadata = publicPageMetadata('/privacy');

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PremiumPageHeader
        title="Privacy Policy"
        subtitle="How Fresh Pick handles information used to run accounts, orders, delivery, and support."
        eyebrow="Legal · Privacy"
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="prose prose-emerald max-w-none">
          <p className="mb-8 font-medium text-muted-foreground">Effective Date: December 2025</p>

          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            At <strong>Fresh Pick</strong>, we use personal information to provide the website, customer accounts, ordering, delivery, and support.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="mb-4 text-2xl font-normal text-foreground">1. Information We Collect</h2>
              <p className="mb-4 text-muted-foreground">When you register or place an order, information may include:</p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li><strong>Personal identification:</strong> Name, email address, and phone number.</li>
                <li><strong>Delivery details:</strong> Physical address and delivery instructions.</li>
                <li><strong>Order information:</strong> Products, quantities, recurring-order settings, and order history.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-normal text-foreground">2. How We Use Your Information</h2>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Process, manage, and deliver orders.</li>
                <li>Communicate about accounts, orders, delivery, or support requests.</li>
                <li>Operate, secure, and improve Fresh Pick services.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-normal text-foreground">3. Data Security</h2>
              <p className="text-muted-foreground">
                Fresh Pick uses technical and operational safeguards intended to protect personal information. Access is limited to systems and people that need the information to provide the service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-normal text-foreground">4. Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy questions or account-data requests, contact <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">{SUPPORT_EMAIL}</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
