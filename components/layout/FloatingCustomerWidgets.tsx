"use client";

import FirstOrderPopup from "@/components/FirstOrderPopup";
import WhatsAppButton from "@/components/WhatsAppButton";

// These widgets are useful after a visitor has started browsing, but they do
// not need to compete with the homepage hero, navigation, and product cards.
export default function FloatingCustomerWidgets() {
  return (
    <>
      <WhatsAppButton />
      <FirstOrderPopup />
    </>
  );
}
