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
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-semibold">
            Est. {getMeasurementType(derivedProduct.measurementUnit)}
          </span>
          <div className="text-right">
            <span className="font-medium text-lg">
              {formatMeasurement(
                derivedProduct.isSoldAsUnit
                  ? validQuantity * derivedProduct.baseMeasurementQuantity
                  : validQuantity,
                derivedProduct.measurementUnit
              )}
            </span>
          </div>
        </div>

        {savings > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-semibold">Savings</span>
            <div className="text-right">
              <span className="font-medium text-lg text-green-600">
                Rs. {savings.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-bold">Total</span>
          <div className="text-right">
            <span className="font-medium text-lg">Rs. {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {product.unitOptions && product.unitOptions.length > 0 && (
          <div className="flex gap-2 justify-end">
            {product.unitOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOptionIndex(idx)}
                className={`px-3 py-1 rounded-full border text-sm ${idx === selectedOptionIndex ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-700 hover:border-green-400'}`}
                aria-pressed={idx === selectedOptionIndex}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <QuantityInputLarge
          value={quantity}
          onChange={(value) => setQuantity(value)}
          min={derivedProduct.minOrderQuantity}
          max={derivedProduct.maxOrderQuantity}
          step={derivedProduct.stepQuantity}
          unit={derivedProduct.isSoldAsUnit ? "" : derivedProduct.measurementUnit}
          isDiscreteItem={derivedProduct.isSoldAsUnit}
          className="w-44 ml-auto"
        />
        {/* Add to Bag Button */}
        <AddToBagButton product={derivedProduct} quantity={validQuantity} />

        {/* Quick Now Button */}
        <QuickOrderButton product={derivedProduct} quantity={validQuantity} />
      </div>
    </>
  );
};
