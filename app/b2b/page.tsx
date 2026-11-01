import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/publicPages";
import JsonLd from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { absoluteUrl } from "@/lib/config/site";
import B2BContent from "./B2BContent";

export const metadata: Metadata = publicPageMetadata("/b2b");

export default function B2BPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": absoluteUrl("/b2b#webpage"),
            "url": absoluteUrl("/b2b"),
            "name": "FreshPick for business",
            "description": "Food supply and supplier partnership enquiries for businesses, growers and makers in Sri Lanka.",
            "isPartOf": { "@id": absoluteUrl("/#website") },
            "about": { "@id": absoluteUrl("/b2b#partnership-service") },
            "inLanguage": "en-LK",
          },
          {
            "@type": "Service",
            "@id": absoluteUrl("/b2b#partnership-service"),
            "name": "Food sourcing and supplier partnership enquiries",
            "serviceType": "Food sourcing, supplier onboarding and business supply partnerships",
            "provider": { "@id": absoluteUrl("/#organization") },
            "areaServed": { "@type": "Country", "name": "Sri Lanka" },
            "audience": [
              { "@type": "BusinessAudience", "name": "Restaurants, cafés, hotels and workplaces" },
              { "@type": "BusinessAudience", "name": "Growers and food producers" },
              { "@type": "BusinessAudience", "name": "Food brands and distributors" },
            ],
          },
        ],
      }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: absoluteUrl("/") },
        { name: "For business", url: absoluteUrl("/b2b") },
      ]} />
      <B2BContent />
    </>
  );
}
