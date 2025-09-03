export const getMeasurementType = (
  measurement: "g" | "kg" | "ml" | "l" | "ea" | "lb"
) => {
  if (measurement === "g" || measurement === "kg" || measurement === "lb") {
    return "weight";
  } else if (measurement === "ml" || measurement === "l") {
    return "volume";
  }
  return "unit";
};

export const formatMeasurement = (
  quantity: number,
  measurement: "g" | "kg" | "ml" | "l" | "ea" | "lb"
) => {
  const formatNumber = (num: number) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  if (measurement === "kg" && quantity < 1) {
    return formatNumber(quantity * 1000) + "g";
  } else if (measurement === "g" && quantity >= 1000) {
    return formatNumber(quantity / 1000) + "kg";
  } else if (measurement === "l" && quantity < 1) {
    return formatNumber(quantity * 1000) + "ml";
  } else if (measurement === "ml" && quantity >= 1000) {
    return formatNumber(quantity / 1000) + "l";
  }
  return formatNumber(quantity) + measurement;
};
