import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface QuantityInputBaseProps {
  value: number | string;
  unit: string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  isDiscreteItem: boolean;
  className?: string;
}

export default function QuantityInputBase({
  value,
  unit,
  onChange,
  min,
  max,
  step,
  isDiscreteItem,
}: QuantityInputBaseProps) {
  const [quantity, setQuantity] = useState<string | number>(value);
  const validQuantity = parseFloat(quantity as string) || 0;

  //   const handleToasts = (value: number | undefined) => {
  //     if (value === undefined) {
  //       toast.error(`Invalid quantity`);
  //     } else if (value < min) {
  //       toast.error(`Invalid quantity`, {
  //         description: `Minimum order quantity is ${min}`,
  //       });
  //     } else
  //     }
  //   };

  const adjustQuantity = (value: number) => {
    if (isDiscreteItem) {
      const rounded = Math.round(value);
      const bounded = Math.min(Math.max(rounded, min), max);
      setQuantity(bounded);
      onChange(bounded);
    } else {
      const rounded = Math.round(value / step) * step;
      const bounded = Math.min(Math.max(rounded, min), max);
      setQuantity(Number(bounded.toFixed(2)));
      onChange(Number(bounded.toFixed(2)));
    }
  };

  const handleInputChange = (value: string) => {
    if (value === "") {
      setQuantity("");
    } else if (!isNaN(Number(value)) && Number(value) >= 0) {
      setQuantity(value);
    }
  };

  const handleInputBlur = () => {
    const value = Number(quantity);

    if (value < min) {
      toast.error(`Invalid quantity`, {
        description: `Minimum order quantity is ${min}${unit}`,
      });
    } else if (value > max) {
      toast.error(`Invalid quantity`, {
        description: `Maximum order quantity is ${max}${unit}`,
      });
    }

    if (quantity === "" || isNaN(value)) {
      setQuantity(min);
      onChange(min);
    } else {
      adjustQuantity(value);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          adjustQuantity(
            isDiscreteItem ? validQuantity - 1 : validQuantity - step
          )
        }
        disabled={validQuantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <label className="flex items-center gap-1 flex-1">
        <Input
          type="text"
          value={quantity}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          step={step}
          min={min}
          max={max}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="text-right w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-0"
        />
        <span className="text-sm text-muted-foreground">
          {unit !== "ea" && unit}
        </span>
      </label>

      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          adjustQuantity(
            isDiscreteItem ? validQuantity + 1 : validQuantity + step
          )
        }
        disabled={validQuantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
