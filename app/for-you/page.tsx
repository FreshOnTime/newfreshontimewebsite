import type { Metadata } from "next";
import ForYouClient from "./ForYouClient";

export const metadata: Metadata = {
  title: "For You | FreshPick Intelligence",
  description: "Personalized food discovery, replenishment suggestions, and product recommendations built from your real FreshPick shopping signals.",
  robots: { index: false, follow: false },
};

export default function ForYouPage() {
  return <ForYouClient />;
}
