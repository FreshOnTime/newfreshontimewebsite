const truncate = (str: string, len: number, cutFromNewline = true): string => {
  // Handle invalid inputs
  if (!str) return "";
  if (len <= 0) return str;
  if (typeof str !== "string") return String(str);

  // Trim whitespace
  const trimmedStr = str.trim();

  // If string is shorter than length, return as is
  if (trimmedStr.length <= len) {
    return trimmedStr;
  }

  // Handle newline truncation
  if (cutFromNewline) {
    const lastNewline = trimmedStr.lastIndexOf("\n", len);
    if (lastNewline !== -1) {
      return trimmedStr.slice(0, lastNewline).trim() + "...";
    }
  }

  // Regular truncation
  return trimmedStr.slice(0, len).trim() + "...";
};

export default truncate;
