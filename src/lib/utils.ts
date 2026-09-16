import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEur(n: number, digits = 0): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("fi-FI", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
  return n < 0 ? `−${formatted}` : formatted;
}

export function formatPct(n: number, digits = 1): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}
