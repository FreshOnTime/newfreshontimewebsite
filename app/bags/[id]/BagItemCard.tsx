import { BagItem } from "@/models/BagItem";
import { calculateItemTotal } from "@/lib/bagCalculations";
import QuantityInput from "@/components/quanity-input";

import { useState } from "react";

interface BagItemCardProps {
  item: BagItem;
  onRemove?: (sku: string) => void;
}

export default function BagItemCard({ item, onRemove }: BagItemCardProps) {
  const [quantity, setQuantity] = useState<number>(item.quantity);
  const { total, savings } = calculateItemTotal(item.product, quantity);

  return (
    <div className="p-4 flex flex-col gap-2 border overflow-auto rounded-lg">
      <div className="flex-1">
        <div className=" grid gap-2 grid-cols-2 mb-2">
          <h3 className="font-medium text-sm max-w-[200px] ">
            {item.product.name}
          </h3>
          <div className="text-right ml-auto">
            <p className="font-medium">Rs. {total.toFixed(2)}</p>
            {(item.product.discountPercentage ?? 0) > 0 && (
              <p className="text-sm text-green-600">
                -Rs. {savings.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <div>
          <QuantityInput
            value={quantity}
            unit={item.product.measurementUnit}
            min={item.product.minOrderQuantity}
            max={item.product.maxOrderQuantity}
            step={item.product.stepQuantity}
            variant="small"
            onChange={setQuantity}
          />
        </div>
      </div>

      <button
        onClick={() => onRemove?.(item.product.sku)}
        className="text-sm text-muted-foreground hover:text-destructive underline self-end"
      >
        Remove
      </button>
    </div>
  );
}
