"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children, className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className || ''}`}>
      <SelectContext.Provider value={{ open, setOpen, value, onValueChange }}>
        {children}
      </SelectContext.Provider>
    </div>
  );
}

export function SelectTrigger({ className, children, ...props }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;

  return (
    <button
      className={`flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${className || ''}`}
      onClick={(e) => {
        e?.stopPropagation();
        setOpen(!open);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ children }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  const { value } = ctx;
  return <span>{children ?? value ?? 'Select an option'}</span>;
}

export function SelectContent({ children, className, style }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  const { open } = ctx;
  if (!open) return null;

  return (
    <div className={`absolute top-full left-0 mt-1 px-3 py-2 bg-card border border-input rounded-md shadow-md z-50 ${className || ''}`} style={style}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className, onSelect }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  const { onValueChange, setOpen } = ctx;

  const handleClick = (e) => {
    e?.stopPropagation();
    onValueChange?.(value);
    onSelect?.(value);
    setOpen(false);
  };

  return (
    <button
      className={`flex flex-col text-left px-3 py-2 hover:bg-muted text-sm ${className || ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
