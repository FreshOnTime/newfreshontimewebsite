import type { Metadata } from "next";
import Link from "next/link";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { SUPPORT_EMAIL } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How FreshPick uses sign-in cookies, browser storage and optional analytics.",
};

export default function CookiesPage() {
  return (
    <div className="bg-background pb-12">
      <PremiumPageHeader title="Cookie Policy" subtitle="How this website uses cookies and browser storage." eyebrow="Your information" />
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="max-w-3xl space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-3 text-xl font-normal text-brand-green">Keeping you signed in</h2>
            <p>FreshPick uses <code>accessToken</code> and <code>refreshToken</code> cookies to recognise your signed-in account and renew your session. These cookies support account features such as shopping bags, orders and your profile. They are set by the server and cannot be read by the website’s browser scripts.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-normal text-brand-green">Remembering searches</h2>
            <p>The website also uses your browser’s local storage for recent searches and cached product categories. This helps show your recent searches and avoids downloading the same category list repeatedly. Local storage is separate from sign-in cookies.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-normal text-brand-green">Analytics and Google sign-in</h2>
            <p>When Google Analytics is configured for the website, it loads Google’s analytics scripts to measure page visits. Those scripts may use their own cookies or browser storage. If you choose Google sign-in, Google also operates its own sign-in experience.</p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-normal text-brand-green">Your browser settings</h2>
            <p>Signing out removes FreshPick’s sign-in cookies. You can also clear this website’s cookies and local storage, or block cookies, in your browser settings. Clearing or blocking sign-in cookies may sign you out and prevent account features from working until you sign in again.</p>
          </section>
          <section className="border-t border-border pt-6">
            <h2 className="mb-3 text-xl font-normal text-brand-green">More information</h2>
            <p>Read our <Link href="/privacy" className="font-medium text-brand-green underline underline-offset-4">Privacy Policy</Link> for information about account and order data. For questions, contact <a href={`mailto:${SUPPORT_EMAIL}`} className="break-words font-medium text-brand-green underline underline-offset-4">{SUPPORT_EMAIL}</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
