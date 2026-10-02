import { discountedUnitPrice, roundMoney } from "@/lib/commercePricing";
import { BagItem } from "@/models/BagItem";
import { Product } from "@/models/product";

export const calculateItemTotal = (product: Product, quantity: number) => {
  const units = product.isSoldAsUnit ? quantity : quantity / product.baseMeasurementQuantity;
  const originalTotal = roundMoney(product.pricePerBaseQuantity * units);
  const total = roundMoney(discountedUnitPrice(product.pricePerBaseQuantity, product.discountPercentage) * units);
  const discountedPrice = roundMoney(originalTotal - total);

  const actualQuantity = product.isSoldAsUnit
    ? product.baseMeasurementQuantity * quantity
    : quantity;

  return {
    discountedPrice: 0,
    total: total,
    originalTotal,
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
