import type { Metadata } from "next";
import { Globe2, Heart, PackageCheck } from "lucide-react";
import EditorialCampaignPage from "@/components/templates/EditorialCampaignPage";

export const metadata: Metadata = {
  title: "Send Groceries to Sri Lanka | FreshPick Diaspora",
  description: "Send considered grocery care packages to family and friends in Colombo from anywhere in the world.",
};

export default function DiasporaPage() {
  return <EditorialCampaignPage
    eyebrow="From afar, with care"
    title="Close, wherever you are."
    subtitle="Send a thoughtful table, a stocked kitchen, or a recurring gesture home to Sri Lanka."
    backgroundImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2400&auto=format&fit=crop"
    introLabel="The diaspora service"
    introTitle="Care that arrives at their door."
    introCopy="Choose the essentials your family loves or let us compose a balanced delivery for them. FreshPick manages local selection, careful packing, and the final handover in Colombo."
    principles={[
      { icon: Globe2, title: "Order globally", description: "Arrange a local grocery delivery for someone you care about while living or travelling abroad." },
      { icon: PackageCheck, title: "Handled locally", description: "Our Colombo team selects, packs, and coordinates each order with attention to the recipient." },
      { icon: Heart, title: "Made personal", description: "Build a one-time care package or create a dependable recurring rhythm for the weeks ahead." },
    ]}
    offeringLabel="Ways to send care"
    offeringTitle="A gesture for every kind of home."
    offerings={[
      { name: "The essentials", detail: "A dependable kitchen foundation of produce, pantry staples, dairy, and everyday favourites.", meta: "One-time" },
      { name: "The family table", detail: "A fuller curation for shared households, celebrations, or a generous restock from afar.", meta: "Curated" },
      { name: "A weekly rhythm", detail: "Recurring provisions that keep the kitchen cared for long after the first delivery arrives.", meta: "Subscription" },
    ]}
    ctaLabel="Start a care package"
    ctaHref="/products"
  />;
}
