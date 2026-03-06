import React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ children, className }) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted aspect-square",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({ children, className }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

