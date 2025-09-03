import { BagItem } from "../models/BagItem";
import { Product } from "../models/product";

export const calculateItemTotal = (product: Product, quantity: number) => {
  const originalTotal = product.isSoldAsUnit
    ? product.pricePerBaseQuantity * quantity
    : (product.pricePerBaseQuantity / product.baseMeasurementQuantity) *
      quantity;

  const discountedPrice = product.discountPercentage
    ? (originalTotal * product.discountPercentage) / 100
    : 0;

  const total = originalTotal - discountedPrice;

  const actualQuantity = product.isSoldAsUnit
    ? product.baseMeasurementQuantity * quantity
    : quantity;

  return {
    discountedPrice: 0,
    total: total,
    originalTotal: product.pricePerBaseQuantity * quantity,
    savings: discountedPrice,
    actualQuantity: actualQuantity,
  };
};
export const calculateBagTotals = (items: BagItem[]) => {
  return items.reduce(
    (acc, item) => {
      const itemCalculation = calculateItemTotal(item.product, item.quantity);
      return {
        total: acc.total + itemCalculation.total,
        originalTotal: acc.originalTotal + itemCalculation.originalTotal,
        savings: acc.savings + itemCalculation.savings,
      };
    },
    { total: 0, originalTotal: 0, savings: 0 }
  );
};
