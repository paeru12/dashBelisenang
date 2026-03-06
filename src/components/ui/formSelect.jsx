"use client";

import { useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem
} from "@/components/ui/selects";

export default function FormSelect({
  label,
  value,
  onChange,
  placeholder = "Pilih",
  items = [],
  itemLabel = "name",
  itemValue = "id",
  error,
  required = false,
  className = "",
}) {
  // AUTO SET LABEL SAAT EDIT MODE
  useEffect(() => {
    if (!value || !items.length) return;

    const found = items.find((x) => String(x[itemValue]) === String(value));
    if (found) {
      window.dispatchEvent(
        new CustomEvent("set-select-label", {
          detail: { key: value, label: found[itemLabel] },
        })
      );
    }
  }, [value, items]);

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium">
          {label} {required && "*"}
        </label>
      )}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full mt-2 bg-slate-50 ${error ? "border-red-500" : ""}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="max-h-60 overflow-y-auto">
          {items.map((item) => (
            <SelectItem
              key={item[itemValue]}
              value={String(item[itemValue])}
            >
              {item[itemLabel]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}