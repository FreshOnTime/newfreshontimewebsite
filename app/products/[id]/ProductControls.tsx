"use client";

import { Product } from "@/models/product";
import { formatMeasurement, getMeasurementType } from "@/lib/measurement";
import { useMemo, useState } from "react";
import { QuickOrderButton } from "./QuickOrderButton";
import { calculateItemTotal } from "@/lib/bagCalculations";
import QuantityInputLarge from "@/components/quanity-input/QuantityInputLarge";
import AddToBagButton from "./AddToBagButton";

export const ProductControls = ({ product }: { product: Product }) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
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
    <div className="space-y-8 bg-zinc-50 p-8 rounded-sm border border-zinc-100">
      <div className="space-y-4">
        {/* Estimated Weight Display - Only if not sold as unit */}
        {!derivedProduct.isSoldAsUnit && (
          <div className="flex justify-between items-end border-b border-zinc-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Est. {getMeasurementType(derivedProduct.measurementUnit)}
            </span>
            <span className="font-serif text-lg text-zinc-900">
              {formatMeasurement(validQuantity, derivedProduct.measurementUnit)}
            </span>
          </div>
        )}

        {/* Total Calculation */}
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Subtotal</span>
          <div className="text-right">
            <span className="font-serif text-2xl text-zinc-900">Rs. {total.toFixed(2)}</span>
            {savings > 0 && (
              <div className="text-xs font-medium text-emerald-600 mt-1">
                You save Rs. {savings.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Unit Options */}
        {product.unitOptions && product.unitOptions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {product.unitOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOptionIndex(idx)}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${idx === selectedOptionIndex
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-emerald-500 hover:text-emerald-700'
                  }`}
                aria-pressed={idx === selectedOptionIndex}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Actions Row */}
        <div className="flex flex-wrap items-stretch gap-4">
          <div className="w-32">
            <QuantityInputLarge
              value={quantity}
              onChange={(value) => setQuantity(value)}
              min={derivedProduct.minOrderQuantity}
              max={derivedProduct.maxOrderQuantity}
              step={derivedProduct.stepQuantity}
              unit={derivedProduct.isSoldAsUnit ? "" : derivedProduct.measurementUnit}
              isDiscreteItem={derivedProduct.isSoldAsUnit}
              className="h-14 w-full"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <AddToBagButton product={derivedProduct} quantity={validQuantity} />
          </div>

          {/* Quick order can be hidden or styled minimally to reduce clutter */}
          {/* <QuickOrderButton product={derivedProduct} quantity={validQuantity} /> */}
        </div>
      </div>
    </div>
  );
};
