"use client";

import { Product } from "@/models/product";
import { formatMeasurement, getMeasurementType } from "@/lib/measurement";
import { useMemo, useState } from "react";
import { calculateItemTotal } from "@/lib/bagCalculations";
import QuantityInputLarge from "@/components/quanity-input/QuantityInputLarge";
import AddToBagButton from "./AddToBagButton";

export const ProductControls = ({ product }: { product: Product }) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const option = useMemo(() => product.unitOptions?.[selectedOptionIndex], [product.unitOptions, selectedOptionIndex]);
  const effectiveUnit = option?.unit || product.measurementUnit;
  const effectiveBaseQty = option?.quantity || product.baseMeasurementQuantity;
  const effectivePrice = option?.price ?? product.pricePerBaseQuantity;

  const [quantity, setQuantity] = useState<string | number>(product.isSoldAsUnit ? 1 : effectiveBaseQty);
  const validQuantity = parseFloat(quantity as string) || 0;

  const derivedProduct = useMemo<Product>(() => ({
    ...product,
    measurementUnit: effectiveUnit as Product["measurementUnit"],
    baseMeasurementQuantity: effectiveBaseQty,
    pricePerBaseQuantity: effectivePrice,
  }), [product, effectiveUnit, effectiveBaseQty, effectivePrice]);

  const { total, savings } = calculateItemTotal(derivedProduct, validQuantity);

  return (
    <div className="space-y-6">
      {product.unitOptions && product.unitOptions.length > 0 && (
        <div>
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">Choose size</p>
          <div className="flex flex-wrap gap-2">
            {product.unitOptions.map((opt, idx) => (
              <button
                key={`${opt.label}-${idx}`}
                type="button"
                onClick={() => setSelectedOptionIndex(idx)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${idx === selectedOptionIndex
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                aria-pressed={idx === selectedOptionIndex}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-[#f6f7f4] p-5">
        {!derivedProduct.isSoldAsUnit && (
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Est. {getMeasurementType(derivedProduct.measurementUnit)}
            </span>
            <span className="font-serif text-lg text-zinc-950">
              {formatMeasurement(validQuantity, derivedProduct.measurementUnit)}
            </span>
          </div>
        )}

        <div className={`${!derivedProduct.isSoldAsUnit ? "pt-4" : ""} flex items-end justify-between gap-4`}>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">Basket total</span>
          <div className="text-right">
            <span className="font-serif text-2xl text-zinc-950">Rs. {total.toFixed(2)}</span>
            {savings > 0 && (
              <div className="mt-1 text-xs font-medium text-emerald-700">
                Save Rs. {savings.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="sm:w-36">
          <QuantityInputLarge
            value={quantity}
            onChange={(value) => setQuantity(value)}
            min={derivedProduct.minOrderQuantity}
            max={derivedProduct.maxOrderQuantity}
            step={derivedProduct.stepQuantity}
            unit={derivedProduct.isSoldAsUnit ? "" : derivedProduct.measurementUnit}
            isDiscreteItem={derivedProduct.isSoldAsUnit}
            className="h-14 w-full rounded-full"
          />
        </div>

        <div className="min-w-0 flex-1">
          <AddToBagButton product={derivedProduct} quantity={validQuantity} />
        </div>
      </div>
    </div>
  );
};
