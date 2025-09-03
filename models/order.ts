export interface OrderItem {
  sku: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number; // price per base quantity (after discount)
  measurementUnit: "g" | "kg" | "ml" | "l" | "ea" | "lb";
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
}

export type PaymentMethod = "cod" | "card";

export interface Order {
  id: string;
  bagId?: string;
  createdAt: string; // ISO string
  status: "placed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  items: OrderItem[];
  totals: {
    subtotal: number;
    savings: number;
    grandTotal: number;
  };
  address: Address;
  email?: string;
  paymentMethod: PaymentMethod;
  deliverySlot?: string;
}
