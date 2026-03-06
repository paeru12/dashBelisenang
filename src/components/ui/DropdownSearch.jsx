"use client";

// components/ui/DropdownSearch.js
import { useState, useRef, useEffect } from "react";

export default function DropdownSearch({
  label = "Pilih Item",
  items = [],
  value,
  onSelect,
  searchPlaceholder = "Cari...",
  buttonPlaceholder = "Pilih...",
  itemKey = "code",
  itemLabel = "name",
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef();

  const filtered = items.filter((i) =>
    i[itemLabel].toLowerCase().includes(search.toLowerCase())
  );

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <label className="text-sm font-medium">
        {label} <span className="text-red-500">*</span>
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="
          w-full px-4 py-2 mt-1 bg-white border border-gray-300 rounded-md
          flex justify-between items-center text-sm
        "
      >
        <span>{items.find((i) => i[itemKey] === value)?.[itemLabel] || buttonPlaceholder}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="
          absolute left-0 right-0 z-10 mt-2 bg-white border
          shadow-lg rounded-md p-2 space-y-2 max-h-64 overflow-y-auto
        ">
          <input
            className="w-full px-3 py-2 border rounded-md"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-1">
            {filtered.map((item) => (
              <button
                type="button"
                key={item[itemKey]}
                onClick={() => {
                  onSelect(item[itemKey]);
                  setOpen(false);
                }}
                className="
                  block w-full text-left px-3 py-2 rounded-md
                  hover:bg-gray-100 active:bg-blue-100
                "
              >
                {item[itemLabel]}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">Tidak ada hasil</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}