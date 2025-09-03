import { Product } from "./product";

export interface BagItem {
  product: Product & {
    id: string;
    price: number;
    unit: string;
    stock: number;
    images: Array<{ url: string; alt: string }>;
  };
  quantity: number;
}
