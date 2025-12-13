import { Image } from "./image";

export interface Product {
  _id?: string; // Mongo ID
  sku: string;
  name: string;
  image: Image;
  description: string;
  ingredients?: string;
  nutritionFacts?: string;
  category?: { id: string; name: string; slug: string };

  baseMeasurementQuantity: number;
  pricePerBaseQuantity: number;
  measurementUnit: "g" | "kg" | "ml" | "l" | "ea" | "lb";
  isSoldAsUnit: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  stepQuantity: number;
  stockQuantity: number;
  isOutOfStock: boolean;
  totalSales: number;
  isFeatured?: boolean;
  discountPercentage?: number;
  lowStockThreshold: number;

  // Optional selectable unit options e.g., [{label:'1kg', quantity:1, unit:'kg', price: X}]
  unitOptions?: Array<{
    label: string;
    quantity: number; // in measurementUnit base (e.g., kg for weight)
    unit: "g" | "kg" | "ml" | "l" | "ea" | "lb";
    price: number; // price for this option
  }>;

  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}
