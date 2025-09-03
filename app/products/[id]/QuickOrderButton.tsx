"use client";

import { Product } from "@/models/product";
import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
interface IQuickOrderButtonProps {
  product: Product;
  quantity: number;
}

export const QuickOrderButton: FC<IQuickOrderButtonProps> = (props) => {
  const { product, quantity } = props;
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [submitting, setSubmitting] = useState(false);

  const handleQuickOrder = async () => {
    try {
      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`);
        return;
      }

      if (!quantity || quantity <= 0) {
        toast.error("Please select a valid quantity");
        return;
      }

      // Build shipping address from user's registrationAddress
  const ra = user.registrationAddress;
      if (!ra) {
        toast.error("Please add a delivery address in your profile before quick ordering");
        router.push("/profile");
        return;
      }

      const shippingAddress = {
        name: ra.recipientName || `${user.firstName} ${user.lastName ?? ''}`.trim(),
        street: [ra.streetAddress, ra.streetAddress2].filter(Boolean).join(", "),
        city: ra.city || ra.town,
        state: ra.state,
        zipCode: ra.postalCode,
        country: ra.countryCode,
        phone: ra.phoneNumber,
      };

      setSubmitting(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          items: [
            {
              productId: product.sku, // accepts _id/sku/slug
              quantity: quantity,
            },
          ],
          shippingAddress,
          notes: "Quick order",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to place order");
      }

      toast.success("Order placed successfully");
      const orderId = data.data?._id || data.data?.id;
      if (orderId) {
        router.push(`/orders/${orderId}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Button
      className="w-full rounded-full px-4 min-h-[3rem] h-auto whitespace-normal leading-tight
      border-primary text-primary hover:bg-primary hover:text-white
      "
      size="lg"
      variant={"outline"}
      disabled={product.isOutOfStock || submitting}
      onClick={handleQuickOrder}
    >
      {submitting ? "Placing order..." : "Quick Order"}
    </Button>
  );
};
