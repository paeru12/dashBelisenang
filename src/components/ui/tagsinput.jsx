"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({
  keywords = [],
  setKeywords,
  maxKeywords = 20,
  readOnly = false,
  disabled = false,
  error = false, // 🔥 WAJIB ADA
}) {
  const [input, setInput] = useState("");

  const addKeyword = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) return;
    if (keywords.length >= maxKeywords) return;

    setKeywords([...keywords, trimmed]);
    setInput("");
  };

  const removeKeyword = (index) => {
    const updated = [...keywords];
    updated.splice(index, 1);
    setKeywords(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(input);
    } else if (e.key === 'Backspace' && !input && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  };

  return (
    <div
      className={`
        flex flex-wrap gap-2 p-2 rounded-lg border transition-all
        ${error
          ? "border-red-500 ring-1 ring-red-300"
          : "border-slate-300 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent"
        }
        ${readOnly ? "bg-slate-50 cursor-not-allowed" : "bg-white"}
        ${keywords.length >= maxKeywords ? "bg-gray-50" : ""}
      `}
    >
      {/* Render keyword tags */}
      {keywords.map((word, index) => (
        <span
          key={index}
          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
        >
          {word}
          {!readOnly && !disabled && (
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="hover:text-blue-900 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </span>
      ))}

      {/* Input */}
      {!readOnly && !disabled && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            keywords.length < maxKeywords
              ? "Tambah keyword..."
              : "Sudah penuh"
          }
          disabled={keywords.length >= maxKeywords}
          className="w-full bg-transparent outline-none text-sm"
        />
      )}

      {/* Counter */}
      <div className="ml-auto text-xs text-slate-400">
        {keywords.length}/{maxKeywords}
      </div>
    </div>
  );
}
