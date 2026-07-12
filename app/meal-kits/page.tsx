import type { Metadata } from "next";
import { ChefHat, Clock, Leaf } from "lucide-react";
import EditorialCampaignPage from "@/components/templates/EditorialCampaignPage";

export const metadata: Metadata = {
  title: "Meal Kits | FreshPick Recipe Boxes",
  description: "Thoughtfully portioned ingredients and chef-guided recipes for composed meals at home.",
};

export default function MealKitsPage() {
  return <EditorialCampaignPage
    eyebrow="The home kitchen"
    title="Dinner, considered."
    subtitle="Beautiful ingredients, measured portions, and a clear path from box to table."
    backgroundImage="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2400&auto=format&fit=crop"
    introLabel="Cook with ease"
    introTitle="The pleasure of cooking, without the planning."
    introCopy="Each kit brings together measured ingredients and a calm, practical recipe. You still chop, stir, taste, and make it yours—we simply remove the shopping list and the uncertainty."
    principles={[
      { icon: Leaf, title: "Freshly selected", description: "Ingredients are chosen to work together, with portions designed around the finished dish." },
      { icon: ChefHat, title: "Kitchen guided", description: "Clear recipes turn good produce into composed meals without demanding professional technique." },
      { icon: Clock, title: "Weeknight ready", description: "Most menus are designed for a relaxed evening rhythm, with less preparation and less waste." },
    ]}
    offeringLabel="A menu for every table"
    offeringTitle="Three ways to make the evening yours."
    offerings={[
      { name: "Sri Lankan table", detail: "Familiar flavours and regional inspiration, assembled for a generous shared meal.", meta: "From Rs. 2,500" },
      { name: "Light & seasonal", detail: "Produce-forward recipes with clean flavours, considered portions, and a lighter finish.", meta: "From Rs. 2,800" },
      { name: "Family supper", detail: "Larger-format favourites designed for gathering, sharing, and easy second helpings.", meta: "From Rs. 3,500" },
    ]}
    ctaLabel="Browse meals"
    ctaHref="/meals"
  />;
}
