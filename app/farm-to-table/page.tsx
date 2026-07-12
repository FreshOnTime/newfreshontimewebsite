import type { Metadata } from "next";
import { Award, MapPin, Sprout } from "lucide-react";
import EditorialCampaignPage from "@/components/templates/EditorialCampaignPage";

export const metadata: Metadata = {
  title: "Farm-to-Table | FreshPick Direct from Sri Lankan Farmers",
  description: "Traceable produce sourced directly from Sri Lankan growers and delivered fresh across Colombo.",
};

export default function FarmToTablePage() {
  return <EditorialCampaignPage
    eyebrow="Farm to table"
    title="Closer to the source."
    subtitle="Produce selected with a clear origin, a shorter journey, and a better story for your table."
    backgroundImage="https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=2400&auto=format&fit=crop"
    introLabel="A shorter journey"
    introTitle="From Sri Lankan soil to the city table."
    introCopy="We work toward direct, dependable relationships with growers and makers. That means clearer provenance, better seasonal judgement, and food handled with care from harvest to handover."
    principles={[
      { icon: Sprout, title: "Season-led", description: "We prioritise what is naturally at its best, rather than forcing every ingredient into every week." },
      { icon: MapPin, title: "Traceable", description: "Clearer sourcing helps us protect quality and gives every delivery a more meaningful sense of place." },
      { icon: Award, title: "Selected", description: "Freshness matters, but so do flavour, handling, consistency, and the judgement behind every selection." },
    ]}
    offeringLabel="Our growing circle"
    offeringTitle="Cultivated through relationships."
    offerings={[
      { name: "Highland vegetables", detail: "Cool-climate greens, roots, and seasonal produce from Sri Lanka’s central growing regions.", meta: "Nuwara Eliya" },
      { name: "Island fruit", detail: "Tropical fruit selected for ripeness, character, and a delivery window that respects the ingredient.", meta: "Across Sri Lanka" },
      { name: "Coastal catch", detail: "Responsibly handled seafood chosen around freshness and availability rather than an endless fixed list.", meta: "Western coast" },
    ]}
    ctaLabel="Explore the collection"
    ctaHref="/products"
  />;
}
