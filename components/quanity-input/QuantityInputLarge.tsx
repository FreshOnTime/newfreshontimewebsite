"use client";

import { cn } from "@/lib/utils";
import QuantityInputBase from "./QuantityInputBase";

interface QuantityInputLargeProps {
  value: number | string;
  unit: string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  isDiscreteItem: boolean;
  className?: string;
}

export default function QuantityInputLarge(props: QuantityInputLargeProps) {
  const { className } = props;

  return (
    <div
      className={cn(
        "flex items-center max-w-44 space-x-3 border border-primary rounded-full overflow-hidden",
        className
      )}
    >
      <QuantityInputBase {...props} />
    </div>
  );
}
