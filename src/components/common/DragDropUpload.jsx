"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export default function DragDropUpload({
  title,
  preview,
  aspect,
  hint,
  onUpload,
  onRemove,
  error,
}) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files?.[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700">
          {title}
        </label>

        {preview && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragging
            ? "border-indigo-500 bg-indigo-50"
            : error
            ? "border-red-500"
            : "border-slate-300"
        }`}
      >
        <label
          className={`flex ${aspect} items-center justify-center cursor-pointer relative overflow-hidden`}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-center text-sm text-slate-500">
              <p className="font-medium">
                Drag & Drop atau Klik untuk Upload
              </p>
              <p className="text-xs mt-1">{hint}</p>
            </div>
          )}

          <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUpload(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
