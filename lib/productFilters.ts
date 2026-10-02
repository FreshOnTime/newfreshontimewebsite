/** Change only applied filters; unsubmitted form values never enter the URL. */
export function updateProductFilters(
  current: string,
  changes: Record<string, string | null>,
): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  next.delete("page");
  return next.toString();
}

export function getPriceRange(params: URLSearchParams): [number, number] {
  const read = (key: string, fallback: number) => {
    const value = params.get(key);
    const parsed = value === null || value === "" ? NaN : Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };
  const minimum = read("minPrice", 0);
  return [minimum, Math.max(minimum, read("maxPrice", Math.max(5000, minimum)))];
}
