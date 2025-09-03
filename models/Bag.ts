import { BagItem } from "./BagItem";

export interface Bag {
  id: string;
  name: string;
  description?: string;
  items: BagItem[];
  tags: string[];
}
