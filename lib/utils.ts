import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// a method that replace given amount of charcters wih "*"
export function obfuscateText(
  text: string,
  startIndex: number,
  endIndex: number
) {
  return (
    text.slice(0, startIndex) +
    "*".repeat(endIndex - startIndex) +
    text.slice(endIndex)
  );
}
