"use client";

import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import QuantityInputBase from "./QuantityInputBase";

interface QuantityInputSmallProps {
  value: number | string;
  unit: string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  isDiscreteItem: boolean;
  className?: string;
}

export default function QuantityInputSmall(props: QuantityInputSmallProps) {
  const { value, unit, className } = props;
  const validQuantity = parseFloat(value as string) || 0;

  return (
    <Popover>
      <PopoverTrigger>
        <div
          className={cn(
            "text-gray-600 text-sm rounded-full border bg-background hover:bg-gray-100 transition-colors cursor-pointer px-3 py-1 flex items-center gap-1.5",
            className
          )}
        >
          {validQuantity}
          {unit !== "ea" && unit}
          <ChevronDown className="h-3 w-3 text-gray-600" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="max-w-[100vw] w-44 border border-primary rounded-full overflow-hidden bg-white shadow-lg p-0">
        <QuantityInputBase {...props} />
      </PopoverContent>
    </Popover>
  );
}
