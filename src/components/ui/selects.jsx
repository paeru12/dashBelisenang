"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { Check, ChevronDown } from "lucide-react";

const SelectContext = createContext(null);

/* ------------------------------
 * MAIN SELECT WRAPPER
 * ------------------------------ */
export function Select({ value, onValueChange, children, className }) {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const rootRef = useRef(null);
  useEffect(() => {
    function handleSetLabel(e) {
      const { key, label } = e.detail;
      if (value == key) {
        setSelectedLabel(label);
      }
    }

    window.addEventListener("set-select-label", handleSetLabel);
    return () => window.removeEventListener("set-select-label", handleSetLabel);
  }, [value]);
  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        onValueChange,
        rootRef,
        selectedLabel,
        setSelectedLabel
      }}
    >
      <div ref={rootRef} className={`relative ${className || ""}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

/* ------------------------------
 * TRIGGER
 * ------------------------------ */
export function SelectTrigger({ className, children }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;

  const { open, setOpen } = ctx;

  return (
    <button
      className={`
        flex items-center justify-between
        w-full rounded-md border border-slate-300
        bg-white px-3 h-9 text-sm shadow-sm
        hover:bg-slate-50 transition
        ${open ? "ring-1 ring-slate-400" : ""}
        ${className || ""}
      `}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
    >
      {children}
      <ChevronDown
        size={16}
        className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

/* ------------------------------
 * VALUE DISPLAY
 * ------------------------------ */
export function SelectValue({ placeholder }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;

  const { selectedLabel, value } = ctx;

  return (
    <span className="truncate text-sm text-slate-700">
      {selectedLabel || placeholder}
    </span>
  );
}

/* ------------------------------
 * CONTENT (Dropdown)
 * ------------------------------ */
export function SelectContent({ children, className }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;

  const { rootRef, open } = ctx;
  const trigger = rootRef.current?.children[0];
  const width = trigger?.offsetWidth || 150;

  if (!open) return null;

  return (
    <div
      className={`
        absolute left-0 top-[110%]
        bg-white border border-slate-200 rounded-md shadow-xl
        py-1 z-50
        animate-in fade-in slide-in-from-top-2
        ${className || ""}
      `}
      style={{ width }}
    >
      {children} {/* ← FIX utama */}
    </div>
  );
}

/* ------------------------------
 * ITEM
 * ------------------------------ */
export function SelectItem({ value, children, className }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;

  const { value: current, onValueChange, setOpen, setSelectedLabel } = ctx;

  const isSelected = current === value;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedLabel(children);   // ⬅ this is the fix
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <div
      onClick={handleSelect}
      className={`
        flex items-center justify-between
        px-3 h-9 text-sm cursor-pointer select-none
        hover:bg-slate-100
        ${isSelected ? "bg-slate-100 font-medium" : ""}
        ${className || ""}
      `}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check size={14} className="text-blue-600" />}
    </div>
  );
}