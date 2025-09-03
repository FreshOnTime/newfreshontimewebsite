"use client";

import QuantityInputLarge from "./QuantityInputLarge";
import QuantityInputSmall from "./QuantityInputSmall";

interface QuantityInputProps {
  value: number | string;
  unit: string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  isDiscreteItem?: boolean;
  className?: string;
  variant?: "small" | "large";
}

export default function QuantityInput({
  value,
  unit,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  isDiscreteItem = false,
  className,
  variant = "small",
}: QuantityInputProps) {
  const Component =
    variant === "large" ? QuantityInputLarge : QuantityInputSmall;

  return (
    <Component
      value={value}
      unit={unit}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      isDiscreteItem={isDiscreteItem}
      className={className}
    />
  );
}
