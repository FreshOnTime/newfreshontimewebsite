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
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center overflow-hidden rounded-lg border border-brand-green-deep/45 bg-background",
        props.className
      )}
    >
      <QuantityInputBase {...props} />
    </div>
  );
}
