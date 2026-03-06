import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value) {
  if (value === null || value === undefined || value === "") return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function parseRupiah(str) {
  if (!str) return 0;
  return Number(str.replace(/[^0-9]/g, ""));
}