"use client";

import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => onOpenChange?.(false)} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-lg p-6 max-w-[50rem] w-full max-h-screen overflow-y-auto z-50">
        {children}
      </div>
    </>
  );
}

export function DialogContent({ children }) {
  return children;
}

export function DialogHeader({ children, title }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function DialogDescription({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
