import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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

  // Keep the input aligned with the parent when the selected size changes.
  useEffect(() => {
    setQuantity(value);
  }, [value]);

  const validQuantity = Number(quantity) || 0;

  const adjustQuantity = (next: number) => {
    const rounded = isDiscreteItem
      ? Math.round(next)
      : Math.round(next / step) * step;
    const bounded = Math.min(Math.max(rounded, min), max);
    const normalized = isDiscreteItem ? bounded : Number(bounded.toFixed(2));
    setQuantity(normalized);
    onChange(normalized);
  };

  const handleInputChange = (next: string) => {
    if (next === "") {
      setQuantity("");
    } else if (!Number.isNaN(Number(next)) && Number(next) >= 0) {
      setQuantity(next);
    }
  };

  const handleInputBlur = () => {
    const next = Number(quantity);

    if (quantity === "" || !Number.isFinite(next)) {
      adjustQuantity(min);
      return;
    }
    if (next < min || next > max) {
      toast.error("Invalid quantity", {
        description: next < min
          ? `Minimum order quantity is ${min}${unit}`
          : `Maximum order quantity is ${max}${unit}`,
      });
    }
    adjustQuantity(next);
  };

  return (
    <div className="flex min-w-0 w-full flex-1 items-center justify-between gap-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0 rounded-none"
        aria-label="Decrease quantity"
        onClick={() => adjustQuantity(isDiscreteItem ? validQuantity - 1 : validQuantity - step)}
        disabled={validQuantity <= min}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>

      <label className="flex min-w-0 flex-1 items-center justify-center gap-1">
        <Input
          type="text"
          inputMode={isDiscreteItem ? "numeric" : "decimal"}
          aria-label="Quantity"
          value={quantity}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-11 min-w-0 w-full border-none bg-transparent px-0 text-center font-semibold tabular-nums shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {unit !== "ea" && unit !== "" && (
          <span className="shrink-0 pr-2 text-xs text-muted-foreground">{unit}</span>
        )}
      </label>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0 rounded-none"
        aria-label="Increase quantity"
        onClick={() => adjustQuantity(isDiscreteItem ? validQuantity + 1 : validQuantity + step)}
        disabled={validQuantity >= max}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
